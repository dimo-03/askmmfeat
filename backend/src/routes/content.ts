import crypto from 'crypto';
import { Router } from 'express';
import type { Response } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { db, recordAuditLog } from '../db';
import { getClientIp, getUserAgent, photoUrl, qs, removePhoto, requireAdmin, withPhoto } from '../middleware';
import type { Donation, Enquiry, EventItem, GalleryItem, TeamMember } from '../types';

type Row = TeamMember | EventItem | GalleryItem;
interface Resource { cols: readonly string[]; order: string; photoRequired: boolean }

// Table names come only from these fixed keys, never from user input.
const RESOURCES: Record<'team' | 'events' | 'gallery', Resource> = {
  team: { cols: ['name', 'designation', 'bio', 'sort_order'], order: 'sort_order, id', photoRequired: false },
  events: { cols: ['title', 'category', 'event_date', 'description', 'beneficiaries'], order: 'event_date DESC, id DESC', photoRequired: false },
  gallery: { cols: ['caption', 'album'], order: 'id DESC', photoRequired: true },
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

const router = Router();

// ---------- Public content ----------
(Object.keys(RESOURCES) as Array<keyof typeof RESOURCES>).forEach(name => {
  router.get(`/${name}`, (req, res) => {
    let sql = `SELECT * FROM ${name}`;
    const params: string[] = [];
    const category = qs(req.query.category), album = qs(req.query.album);
    if (name === 'events' && category) { sql += ' WHERE category = ?'; params.push(category); }
    if (name === 'gallery' && album) { sql += ' WHERE album = ?'; params.push(album); }
    const limit = Math.min(200, parseInt(qs(req.query.limit) ?? '') || 100);
    const rows = db.prepare(`${sql} ORDER BY ${RESOURCES[name].order} LIMIT ${limit}`).all(...params) as Row[];
    res.json(rows.map(photoUrl));
  });
});

router.get('/site', (_req, res) => {
  const stats = db.prepare('SELECT COUNT(*) events, COALESCE(SUM(beneficiaries), 0) beneficiaries FROM events').get();
  res.json({
    ...config.site,
    donationsEnabled: !!(config.razorpay.keyId && config.razorpay.keySecret),
    razorpayKeyId: config.razorpay.keyId,
    stats,
  });
});

// ---------- Contact form ----------
router.post('/contact', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errors: ['Too many contact submissions. Please wait a moment and try again.'] },
}), (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  if (b.website) return res.json({ message: 'Thank you. We will reply soon.' }); // honeypot field
  const name = text(b.name), email = text(b.email), message = text(b.message);
  const errors: string[] = [];
  if (!name) errors.push('Name is required.');
  if (!EMAIL.test(email)) errors.push('Enter a valid email address.');
  if (message.length < 5) errors.push('Write a short message.');
  if (errors.length) return res.status(400).json({ errors });
  db.prepare('INSERT INTO enquiries (name, email, phone, message) VALUES (?,?,?,?)')
    .run(name, email, text(b.phone), message.slice(0, 3000));
  res.status(201).json({ message: 'Thank you. We will reply soon.' });
});

// ---------- Donations (Razorpay) ----------
router.post('/donate/order', rateLimit({ windowMs: 60 * 60 * 1000, max: 30 }), async (req, res: Response) => {
  const { keyId, keySecret } = config.razorpay;
  if (!keyId || !keySecret) return res.status(503).json({ errors: ['Online donations are not set up yet.'] });
  const b = (req.body ?? {}) as Record<string, unknown>;
  const amount = Math.round(Number(b.amount) * 100);
  const errors: string[] = [];
  if (!(amount >= 100 && amount <= 50_000_000)) errors.push('Enter an amount of at least ₹1.');
  if (!text(b.name)) errors.push('Name is required.');
  if (!EMAIL.test(text(b.email))) errors.push('Enter a valid email address.');
  if (errors.length) return res.status(400).json({ errors });
  try {
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64') },
      body: JSON.stringify({ amount, currency: 'INR', receipt: 'don_' + Date.now() }),
    });
    const order = (await r.json()) as { id: string; error?: { description?: string } };
    if (!r.ok) throw new Error(order.error?.description || 'Gateway error');
    db.prepare(`INSERT INTO donations (order_id, amount_paise, name, email, phone, pan, message) VALUES (?,?,?,?,?,?,?)`)
      .run(order.id, amount, text(b.name), text(b.email), text(b.phone), text(b.pan).toUpperCase(), text(b.message));
    res.json({ order_id: order.id, amount, key: keyId });
  } catch (err) {
    console.error('Razorpay order failed:', (err as Error).message);
    res.status(502).json({ errors: ['Could not start the payment. Please try again.'] });
  }
});

// Called by the frontend after checkout; the signature is verified server-side.
router.post('/donate/verify', (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const orderId = text(b.razorpay_order_id), paymentId = text(b.razorpay_payment_id), sig = text(b.razorpay_signature);
  const secret = config.razorpay.keySecret;
  if (!orderId || !paymentId || !sig || !secret) return res.status(400).json({ errors: ['Invalid payment details.'] });
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  const ok = sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return res.status(400).json({ errors: ['Payment could not be verified.'] });

  const donation = db.prepare('SELECT * FROM donations WHERE order_id = ?').get(orderId) as Donation | undefined;
  if (donation) {
    const donationMembershipId = `DONATION-${orderId}`;
    const existingPayment = db.prepare('SELECT id FROM payments WHERE membership_id = ? OR reference_id = ? ORDER BY id DESC LIMIT 1').get(donationMembershipId, paymentId) as { id: number } | undefined;
    if (!existingPayment) {
      db.prepare(`
        INSERT INTO payments (member_id, membership_id, method, amount, status, reference_id, notes)
        VALUES (@member_id, @membership_id, 'online', @amount, 'Paid', @reference_id, @notes)
      `).run({
        member_id: null,
        membership_id: donationMembershipId,
        amount: donation.amount_paise / 100,
        reference_id: paymentId,
        notes: `Donation by ${donation.name} (${donation.email})`,
      });
    }
  }

  db.prepare(`UPDATE donations SET status = 'paid', payment_id = ? WHERE order_id = ?`).run(paymentId, orderId);
  res.json({ message: 'Thank you for your donation.' });
});

// ---------- Admin ----------
const admin = Router();
admin.use(requireAdmin);

admin.get('/enquiries', (_req, res) =>
  res.json(db.prepare('SELECT * FROM enquiries ORDER BY id DESC LIMIT 500').all() as Enquiry[]));
admin.patch('/enquiries/:id/read', (req, res) => {
  db.prepare('UPDATE enquiries SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
admin.delete('/enquiries/:id', (req, res) => {
  db.prepare('DELETE FROM enquiries WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
admin.get('/donations', (_req, res) =>
  res.json(db.prepare(`SELECT * FROM donations WHERE status = 'paid' ORDER BY id DESC LIMIT 500`).all() as Donation[]));

(Object.keys(RESOURCES) as Array<keyof typeof RESOURCES>).forEach(name => {
  const r = RESOURCES[name];
  const pick = (body: Record<string, unknown>): Record<string, string> =>
    Object.fromEntries(r.cols.filter(c => body[c] !== undefined).map(c => [c, text(body[c])]));
  const reject = (res: Response, file: Express.Multer.File | undefined, msg: string) => {
    removePhoto(file?.filename);
    return res.status(400).json({ errors: [msg] });
  };
  const find = (id: string | number) => db.prepare(`SELECT * FROM ${name} WHERE id = ?`).get(id) as Row | undefined;

  admin.get(`/${name}`, (_req, res) =>
    res.json((db.prepare(`SELECT * FROM ${name} ORDER BY ${r.order}`).all() as Row[]).map(photoUrl)));

  admin.post(`/${name}`, withPhoto, (req, res) => {
    const d = pick(req.body ?? {});
    const photoUrlInput = text(req.body.photo_url) || text(req.body.photo);
    if (name === 'gallery') {
      if (!d.caption && !d.album) return reject(res, req.file, 'Caption or album is required.');
      if (!req.file && !photoUrlInput) return reject(res, req.file, 'Upload a photo file or provide an image URL.');
    } else {
      if (!d[r.cols[0]]) return reject(res, req.file, `${r.cols[0]} is required.`);
      if (r.photoRequired && !req.file && !photoUrlInput) return reject(res, req.file, 'Choose a photo.');
    }
    const photoVal = req.file?.filename ?? (photoUrlInput || null);
    const row: Record<string, string | null> = { ...d, photo: photoVal };
    const cols = Object.keys(row);
    const info = db.prepare(`INSERT INTO ${name} (${cols.join(',')}) VALUES (${cols.map(c => '@' + c).join(',')})`).run(row);
    const created = photoUrl(find(info.lastInsertRowid as number) as Row);
    recordAuditLog({
      admin_id: req.admin?.id,
      admin_user: req.admin?.username,
      action: `${name.toUpperCase()}_CREATE`,
      entity_type: name,
      entity_id: String(info.lastInsertRowid),
      details: { caption: (created as GalleryItem).caption, album: (created as GalleryItem).album },
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req),
    });
    res.status(201).json(created);
  });

  admin.put(`/${name}/:id`, withPhoto, (req, res) => {
    const old = find(req.params.id);
    if (!old) { removePhoto(req.file?.filename); return res.status(404).json({ errors: ['Not found.'] }); }
    const d: Record<string, string> = pick(req.body ?? {});
    const photoUrlInput = text(req.body.photo_url) || text(req.body.photo);
    if (req.file) {
      d.photo = req.file.filename;
    } else if (photoUrlInput) {
      d.photo = photoUrlInput;
    }
    const keys = Object.keys(d);
    if (keys.length) db.prepare(`UPDATE ${name} SET ${keys.map(k => `${k} = @${k}`).join(', ')} WHERE id = @id`).run({ ...d, id: old.id });
    if (req.file && old.photo && !old.photo.startsWith('http')) removePhoto(old.photo);

    recordAuditLog({
      admin_id: req.admin?.id,
      admin_user: req.admin?.username,
      action: `${name.toUpperCase()}_UPDATE`,
      entity_type: name,
      entity_id: String(old.id),
      details: { changes: d },
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req),
    });

    res.json(photoUrl(find(old.id) as Row));
  });

  admin.delete(`/${name}/:id`, (req, res) => {
    const old = find(req.params.id);
    if (!old) return res.status(404).json({ errors: ['Not found.'] });
    db.prepare(`DELETE FROM ${name} WHERE id = ?`).run(old.id);
    if (old.photo && !old.photo.startsWith('http')) removePhoto(old.photo);

    recordAuditLog({
      admin_id: req.admin?.id,
      admin_user: req.admin?.username,
      action: `${name.toUpperCase()}_DELETE`,
      entity_type: name,
      entity_id: String(old.id),
      details: { item: old },
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req),
    });

    res.json({ ok: true });
  });
});

router.use('/admin/cms', admin);
export default router;
