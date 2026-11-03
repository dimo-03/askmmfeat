import crypto from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { db, recordAuditLog, revokeToken } from '../db';
import { getClientIp, getUserAgent, requireAdmin } from '../middleware';

interface AdminRow {
  id: number;
  username: string;
  password_hash: string;
}

interface MemberAccountRow {
  id: number;
  name: string;
  email: string;
  mobile: string;
  password_hash: string;
}

const router = Router();

function memberPayload(req: import('express').Request): jwt.JwtPayload | null {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret, { audience: 'askmm-member', issuer: 'askmm-backend' }) as jwt.JwtPayload;
    return payload.role === 'member' && payload.sub ? payload : null;
  } catch {
    return null;
  }
}

// Strict rate limiter for admin login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: ['Too many login attempts. Please try again after 15 minutes.'] },
});

const memberLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: ['Too many login attempts. Please try again after 15 minutes.'] },
});

router.post('/member/signup', memberLoginLimiter, (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const mobile = typeof req.body?.mobile === 'string' ? req.body.mobile.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (name.length < 2) return res.status(400).json({ errors: ['Please enter your full name.'] });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ errors: ['Please enter a valid email address.'] });
  if (!/^[0-9+\-\s]{7,15}$/.test(mobile)) return res.status(400).json({ errors: ['Please enter a valid mobile number.'] });
  if (password.length < 8) return res.status(400).json({ errors: ['Password must be at least 8 characters.'] });

  const existing = db.prepare('SELECT id FROM member_accounts WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ errors: ['An account with this email already exists.'] });

  const result = db.prepare(
    'INSERT INTO member_accounts (name, email, mobile, password_hash) VALUES (?, ?, ?, ?)',
  ).run(name, email, mobile, bcrypt.hashSync(password, 10));

  res.status(201).json({ message: 'Member account created successfully.', id: Number(result.lastInsertRowid) });
});

router.post('/member/login', memberLoginLimiter, (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const account = db.prepare('SELECT * FROM member_accounts WHERE email = ?').get(email) as MemberAccountRow | undefined;

  if (!account || !bcrypt.compareSync(password, account.password_hash)) {
    return res.status(401).json({ errors: ['Invalid email address or password.'] });
  }

  const token = jwt.sign(
    { sub: String(account.id), email: account.email, role: 'member' },
    config.jwtSecret,
    { expiresIn: '7d', issuer: 'askmm-backend', audience: 'askmm-member' },
  );
  res.json({
    token,
    member: { id: account.id, name: account.name, email: account.email, mobile: account.mobile },
  });
});

router.get('/member/me', (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ errors: ['Authentication required.'] });

  try {
    const payload = jwt.verify(token, config.jwtSecret, { audience: 'askmm-member', issuer: 'askmm-backend' }) as jwt.JwtPayload;
    if (payload.role !== 'member' || !payload.sub) return res.status(401).json({ errors: ['Invalid member session.'] });
    const account = db.prepare('SELECT id, name, email, mobile FROM member_accounts WHERE id = ?').get(payload.sub) as Omit<MemberAccountRow, 'password_hash'> | undefined;
    if (!account) return res.status(401).json({ errors: ['Member account not found.'] });
    res.json({ member: account });
  } catch {
    res.status(401).json({ errors: ['Your member session has expired. Please sign in again.'] });
  }
});

router.get('/member/notifications', (req, res) => {
  const payload = memberPayload(req);
  if (!payload?.sub) return res.status(401).json({ errors: ['Authentication required.'] });

  const notifications = db.prepare(`
    SELECT n.id, n.title, n.message, n.created_at, r.is_read, r.read_at
    FROM notification_recipients r
    JOIN notifications n ON n.id = r.notification_id
    WHERE r.member_account_id = ?
    ORDER BY n.created_at DESC, n.id DESC
    LIMIT 100
  `).all(payload.sub) as Array<{ id: number; title: string; message: string; created_at: string; is_read: number; read_at: string | null }>;

  res.json({
    notifications,
    unread_count: notifications.filter((notification) => !notification.is_read).length,
  });
});

router.patch('/member/notifications/:id/read', (req, res) => {
  const payload = memberPayload(req);
  if (!payload?.sub) return res.status(401).json({ errors: ['Authentication required.'] });

  const result = db.prepare(`
    UPDATE notification_recipients
    SET is_read = 1, read_at = COALESCE(read_at, datetime('now'))
    WHERE notification_id = ? AND member_account_id = ?
  `).run(req.params.id, payload.sub);

  if (!result.changes) return res.status(404).json({ errors: ['Notification not found.'] });
  res.json({ success: true });
});

router.post('/admin/notifications', requireAdmin, (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const audience = typeof req.body?.audience === 'string' ? req.body.audience : 'all';
  const category = typeof req.body?.category === 'string' ? req.body.category.trim() : '';
  const selectedIds = Array.isArray(req.body?.member_ids) ? req.body.member_ids.map(String) : [];

  if (!title || !message) return res.status(400).json({ errors: ['Title and message are required.'] });
  if (!['all', 'category', 'selected'].includes(audience)) return res.status(400).json({ errors: ['Invalid audience.'] });
  if (audience === 'category' && !category) return res.status(400).json({ errors: ['Category is required.'] });

  let accounts: Array<{ id: number }> = [];
  if (audience === 'all') {
    accounts = db.prepare('SELECT id FROM member_accounts').all() as Array<{ id: number }>;
  } else if (audience === 'category') {
    accounts = db.prepare(`
      SELECT DISTINCT ma.id
      FROM member_accounts ma
      JOIN members m ON LOWER(m.email) = LOWER(ma.email)
      WHERE m.category = ?
    `).all(category) as Array<{ id: number }>;
  } else {
    if (!selectedIds.length) return res.status(400).json({ errors: ['Select at least one member.'] });
    const placeholders = selectedIds.map(() => '?').join(',');
    accounts = db.prepare(`
      SELECT DISTINCT ma.id
      FROM member_accounts ma
      JOIN members m ON LOWER(m.email) = LOWER(ma.email)
      WHERE m.membership_id IN (${placeholders})
    `).all(...selectedIds) as Array<{ id: number }>;
  }

  const result = db.prepare(
    'INSERT INTO notifications (title, message, audience, category, recipient_count) VALUES (?, ?, ?, ?, ?)',
  ).run(title, message, audience, audience === 'category' ? category : null, accounts.length);

  const insertRecipient = db.prepare(
    'INSERT OR IGNORE INTO notification_recipients (notification_id, member_account_id) VALUES (?, ?)',
  );
  for (const account of accounts) insertRecipient.run(Number(result.lastInsertRowid), account.id);

  res.status(201).json({ success: true, recipient_count: accounts.length });
});

router.get('/admin/notifications', requireAdmin, (_req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications ORDER BY created_at DESC, id DESC LIMIT 100
  `).all();
  res.json({ notifications });
});

// Admin login
router.post('/admin/login', loginLimiter, (req, res) => {
  const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username ?? '') as AdminRow | undefined;
  if (!admin || !bcrypt.compareSync(password ?? '', admin.password_hash)) {
    recordAuditLog({
      admin_user: username ?? 'unknown',
      action: 'ADMIN_LOGIN_FAILED',
      entity_type: 'auth',
      details: { reason: 'Invalid credentials', attempted_username: username },
      ip_address: ip,
      user_agent: ua,
    });
    return res.status(401).json({ errors: ['Incorrect username or password.'] });
  }

  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { id: admin.id, username: admin.username, jti },
    config.jwtSecret,
    { expiresIn: '8h' }
  );

  recordAuditLog({
    admin_id: admin.id,
    admin_user: admin.username,
    action: 'ADMIN_LOGIN_SUCCESS',
    entity_type: 'auth',
    details: { jti },
    ip_address: ip,
    user_agent: ua,
  });

  res.json({ token, username: admin.username });
});

// Admin logout - blacklists the active JWT token
router.post('/admin/logout', requireAdmin, (req, res) => {
  const admin = req.admin!;
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  if (admin.jti) {
    const expiresAt = admin.exp ?? Math.floor(Date.now() / 1000) + 8 * 3600;
    revokeToken(admin.jti, admin.id, expiresAt);
  }

  recordAuditLog({
    admin_id: admin.id,
    admin_user: admin.username,
    action: 'ADMIN_LOGOUT',
    entity_type: 'auth',
    details: { jti: admin.jti },
    ip_address: ip,
    user_agent: ua,
  });

  res.json({ success: true, message: 'Logged out successfully and token has been revoked.' });
});

// Change admin password with complexity policy and token invalidation
router.post('/admin/password', requireAdmin, (req, res) => {
  const { current, next } = (req.body ?? {}) as { current?: string; next?: string };
  const ip = getClientIp(req);
  const ua = getUserAgent(req);
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin!.id) as AdminRow;

  if (!bcrypt.compareSync(current ?? '', admin.password_hash)) {
    recordAuditLog({
      admin_id: admin.id,
      admin_user: admin.username,
      action: 'ADMIN_PASSWORD_CHANGE_FAILED',
      entity_type: 'auth',
      details: { reason: 'Incorrect current password' },
      ip_address: ip,
      user_agent: ua,
    });
    return res.status(400).json({ errors: ['Current password is incorrect.'] });
  }

  // Password policy check
  if (!next || next.length < 8) {
    return res.status(400).json({ errors: ['New password must be at least 8 characters long.'] });
  }
  if (!/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/[0-9]/.test(next)) {
    return res.status(400).json({
      errors: ['New password must contain at least one uppercase letter, one lowercase letter, and one number.'],
    });
  }

  // Update password
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(next, 12), admin.id);

  // Invalidate current token so re-login is required with new credentials
  if (req.admin?.jti) {
    const expiresAt = req.admin.exp ?? Math.floor(Date.now() / 1000) + 8 * 3600;
    revokeToken(req.admin.jti, admin.id, expiresAt);
  }

  recordAuditLog({
    admin_id: admin.id,
    admin_user: admin.username,
    action: 'ADMIN_PASSWORD_CHANGED',
    entity_type: 'auth',
    details: { reason: 'Password updated by admin' },
    ip_address: ip,
    user_agent: ua,
  });

  res.json({ message: 'Password updated successfully. Please sign in again with your new credentials.' });
});

// Return currently authenticated admin identity
router.get('/admin/me', requireAdmin, (req, res) => {
  res.json({ id: req.admin!.id, username: req.admin!.username });
});

export default router;
