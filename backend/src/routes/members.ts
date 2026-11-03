import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { db, rawDb, recordAuditLog, nextMembershipId, expireLapsedMembers } from '../db';
import { isSupabaseReady, supabaseDb } from '../supabase';
import { getClientIp, getUserAgent, membershipDocumentUrls, photoUrl, qs, removePhoto, withMembershipDocuments, withPhoto } from '../middleware';
import { MEMBERSHIP_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../types';
import type { Member, MembershipStatus, PublicMember, PaymentMethod, PaymentStatus, PaymentRecord } from '../types';
import { asFlag, validateMember } from '../validate';
import type { MemberInput } from '../validate';

type SqlParams = Record<string, string | number>;
const PUBLIC_COLS = 'id, membership_id, name, photo, designation, location, category, is_active, membership_status, validity_start, validity_end, organization, payment_method, payment_status';

/** Unified auto-expiry check across SQLite and Supabase */
export async function syncExpireLapsedMembers(): Promise<{ sqliteExpired: number; supabaseExpired: number }> {
  const sqliteExpired = expireLapsedMembers();
  let supabaseExpired = 0;
  if (isSupabaseReady()) {
    try {
      supabaseExpired = await supabaseDb.expireLapsedMembers();
    } catch (err) {
      console.error('Supabase auto-expire error:', err);
    }
  }
  return { sqliteExpired, supabaseExpired };
}

async function getMember(id: number | string): Promise<Member | undefined> {
  let member: Member | undefined;
  if (isSupabaseReady()) {
    try {
      const supa = await supabaseDb.getMember(id);
      if (supa) member = supa;
    } catch (err) {
      console.error('Supabase getMember error, falling back to local SQLite:', err);
    }
  }
  if (!member) {
    const isNum = !isNaN(Number(id));
    member = (isNum
      ? db.prepare('SELECT * FROM members WHERE id = ? OR membership_id = ?').get(Number(id), String(id))
      : db.prepare('SELECT * FROM members WHERE membership_id = ?').get(String(id))) as Member | undefined;
  }

  // Automatic expiration check for individual member
  if (member && member.validity_end) {
    const today = new Date().toISOString().split('T')[0];
    if (member.validity_end < today && (member.is_active === 1 || member.membership_status !== 'Expired')) {
      member.is_active = 0;
      member.membership_status = 'Expired';
      db.prepare(`UPDATE members SET is_active = 0, membership_status = 'Expired', updated_at = datetime('now') WHERE id = ?`).run(member.id);
      if (isSupabaseReady()) {
        supabaseDb.updateMember(member.id, { is_active: 0, membership_status: 'Expired' }).catch(() => {});
      }
    }
  }

  return member;
}

function filters(q: Record<string, unknown>, adminView: boolean): { clause: string; params: SqlParams } {
  const where: string[] = [];
  const params: SqlParams = {};
  if (!adminView) where.push(`membership_status <> 'Pending'`);
  const search = qs(q.q);
  if (search) {
    where.push(adminView
      ? '(name LIKE @q OR membership_id LIKE @q OR email LIKE @q OR mobile LIKE @q OR designation LIKE @q OR location LIKE @q OR payment_reference LIKE @q)'
      : '(name LIKE @q OR membership_id LIKE @q OR designation LIKE @q OR location LIKE @q)');
    params.q = `%${search}%`;
  }
  const category = qs(q.category), location = qs(q.location), ms = qs(q.membership_status);
  let payMethod = qs(q.payment_method)?.toLowerCase();
  if (payMethod === 'cash') payMethod = 'offline';
  const payStatus = qs(q.payment_status);

  if (category) { where.push('category = @category'); params.category = category; }
  if (location) { where.push('location LIKE @location'); params.location = `%${location}%`; }
  if (q.active === '1' || q.active === '0') { where.push('is_active = @active'); params.active = Number(q.active); }
  if (ms) { where.push('membership_status = @ms'); params.ms = ms; }
  if (payMethod === 'offline') {
    where.push("(payment_method = 'offline' OR payment_method = 'cash')");
  } else if (payMethod) {
    where.push('payment_method = @payMethod');
    params.payMethod = payMethod;
  }
  if (payStatus) { where.push('payment_status = @payStatus'); params.payStatus = payStatus; }

  return { clause: where.length ? 'WHERE ' + where.join(' AND ') : '', params };
}

async function list(q: Record<string, unknown>, adminView: boolean) {
  await syncExpireLapsedMembers();
  const page = Math.max(1, parseInt(qs(q.page) ?? '') || 1);
  const limit = Math.min(100, Math.max(1, parseInt(qs(q.limit) ?? '') || 12));

  if (isSupabaseReady()) {
    try {
      const supaRes = await supabaseDb.listMembers({
        adminView,
        q: qs(q.q),
        category: qs(q.category),
        location: qs(q.location),
        membership_status: qs(q.membership_status),
        payment_method: qs(q.payment_method)?.toLowerCase(),
        payment_status: qs(q.payment_status),
        active: q.active === '1' ? 1 : q.active === '0' ? 0 : undefined,
        sort: qs(q.sort),
        page,
        limit,
      });
      if (supaRes && supaRes.total >= 0) {
        return {
          ...supaRes,
            members: supaRes.members.map((member) => membershipDocumentUrls(photoUrl(member))),
        };
      }
    } catch (err) {
      console.error('Supabase listMembers error, falling back to local SQLite:', err);
    }
  }

  // SQLite fallback & local operation
  const { clause, params } = filters(q, adminView);
  const sorts: Record<string, string> = { name: 'name COLLATE NOCASE', newest: 'id DESC', validity: 'validity_end' };
  const order = sorts[qs(q.sort) ?? ''] ?? sorts.newest;
  const total = (db.prepare(`SELECT COUNT(*) c FROM members ${clause}`).get(params) as { c: number }).c;
  const rows = db.prepare(
    `SELECT ${adminView ? '*' : PUBLIC_COLS} FROM members ${clause} ORDER BY ${order} LIMIT @limit OFFSET @offset`,
  ).all({ ...params, limit, offset: (page - 1) * limit }) as Array<Member | PublicMember>;
  return { total, page, limit, pages: Math.ceil(total / limit), members: rows.map((member) => membershipDocumentUrls(photoUrl(member))) };
}

async function insertMember(data: MemberInput, photo?: string, documents?: { pan_card?: string; aadhaar_card?: string }): Promise<Member> {
  const row: Record<string, unknown> = {
    membership_id: nextMembershipId(),
    photo: photo ?? null,
    is_active: 0,
    membership_status: 'Pending',
    payment_method: 'offline',
    payment_status: 'Pending',
    payment_amount: 0,
    payment_reference: null,
    payment_date: null,
    pan_card: documents?.pan_card ?? null,
    aadhaar_card: documents?.aadhaar_card ?? null,
    ...data,
  };
  const cols = Object.keys(row);
  const info = db.prepare(`INSERT INTO members (${cols.join(',')}) VALUES (${cols.map(c => '@' + c).join(',')})`).run(row);
  const localMember = (db.prepare('SELECT * FROM members WHERE id = ?').get(info.lastInsertRowid as number)) as Member;

  if (isSupabaseReady()) {
    try {
      const supaMember = await supabaseDb.insertMember(row);
      if (supaMember) return supaMember;
    } catch (err) {
      console.error('Supabase insertMember error, saved in local SQLite:', err);
    }
  }

  return localMember;
}

async function updateMember(idOrCode: string | number, data: Record<string, unknown>, photo?: string): Promise<void> {
  const sets = Object.keys(data).map(k => `${k} = @${k}`);
  const key = String(idOrCode);
  const params: Record<string, unknown> = { ...data, key };
  if (photo) { sets.push('photo = @photo'); params.photo = photo; }
  if (sets.length) {
    db.prepare(`UPDATE members SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = @key OR membership_id = @key`).run(params);
  }

  if (isSupabaseReady()) {
    try {
      const supaData = { ...data };
      if (photo) supaData.photo = photo;
      await supabaseDb.updateMember(idOrCode, supaData);
    } catch (err) {
      console.error('Supabase updateMember error:', err);
    }
  }
}

// ---------- Public Router ----------
export const publicRouter = Router();

publicRouter.get('/config', (_req, res) =>
  res.json({
    categories: config.categories,
    membershipStatuses: MEMBERSHIP_STATUSES,
    paymentMethods: PAYMENT_METHODS,
    paymentStatuses: PAYMENT_STATUSES,
    razorpay: {
      enabled: !!(config.razorpay.keyId && config.razorpay.keySecret),
      keyId: config.razorpay.keyId,
    },
  }));

publicRouter.get('/members', async (req, res) => res.json(await list(req.query, false)));

publicRouter.post('/register', rateLimit({ windowMs: 60 * 60 * 1000, max: 20, standardHeaders: true }), withMembershipDocuments, async (req, res) => {
  const { errors, data } = validateMember(req.body);
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (!files?.pan_card?.[0]) errors.push('PAN card upload is required.');
  if (!files?.aadhaar_card?.[0]) errors.push('Aadhaar card upload is required.');
  if (errors.length) {
    Object.values(files ?? {}).flat().forEach(file => removePhoto(file.filename));
    return res.status(400).json({ errors });
  }
  // Self-registrations are always Pending + Inactive until payment is verified or admin approves them.
  const { is_active, membership_status, validity_start, validity_end, ...allowed } = data;
  void is_active; void membership_status; void validity_start; void validity_end;
  const documents = {
    pan_card: files?.pan_card?.[0]?.filename,
    aadhaar_card: files?.aadhaar_card?.[0]?.filename,
  };
  const m = await insertMember(allowed, files?.photo?.[0]?.filename, documents);
  recordAuditLog({
    action: 'MEMBER_REGISTRATION_PENDING',
    entity_type: 'member',
    entity_id: m.membership_id,
    details: { member_name: m.name, verification_required: true, documents_uploaded: ['PAN', 'Aadhaar'] },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });
  if (allowed.payment_method) {
    try {
      db.prepare(`
        INSERT INTO payments (member_id, membership_id, method, amount, status, reference_id, notes)
        VALUES (@member_id, @membership_id, @method, @amount, 'Pending', @reference_id, @notes)
      `).run({
        member_id: m.id,
        membership_id: m.membership_id,
        method: m.payment_method,
        amount: m.payment_amount || 0,
        reference_id: m.payment_reference || null,
        notes: `Registration payment reference (${m.payment_method})`,
      });
    } catch (err) {
      console.error('Failed to log registration payment ledger entry:', err);
    }
  }
  res.status(201).json({
    message: 'Registration received. Your membership will be active once payment is verified and approved.',
    membership_id: m.membership_id,
    payment_method: m.payment_method,
    payment_status: m.payment_status,
  });
});

// ---------- Payment Methods (Cash & Online Razorpay) ----------

// ---------- Payment Methods (Online & Offline) ----------

// 1. Record Offline Payment (Cash / Cheque / Office Desk)
publicRouter.post(['/payments/offline', '/payments/cash'], async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const membershipId = qs(b.membership_id);
  const amount = Number(b.amount) || 0;
  const refId = qs(b.reference_id) || `OFFLINE-${Date.now()}`;
  const notes = qs(b.notes) || 'Offline payment at office/desk';

  if (!membershipId) {
    return res.status(400).json({ errors: ['membership_id is required for offline payment.'] });
  }

  const member = await getMember(membershipId);
  if (!member) {
    return res.status(404).json({ errors: ['Member not found.'] });
  }

  // Record in payments ledger (SQLite)
  const pInfo = db.prepare(`
    INSERT INTO payments (member_id, membership_id, method, amount, status, reference_id, notes)
    VALUES (@member_id, @membership_id, 'offline', @amount, 'Paid', @reference_id, @notes)
  `).run({
    member_id: member.id,
    membership_id: member.membership_id,
    amount,
    reference_id: refId,
    notes,
  });

  // Update member record (SQLite)
  db.prepare(`
    UPDATE members
    SET payment_method = 'offline', payment_status = 'Paid', payment_amount = @amount,
        payment_reference = @refId, payment_date = datetime('now'), updated_at = datetime('now')
    WHERE id = @id
  `).run({ id: member.id, amount, refId });

  // Sync to Supabase if connected
  if (isSupabaseReady()) {
    try {
      await supabaseDb.updateMember(member.id, {
        payment_method: 'offline',
        payment_status: 'Paid',
        payment_amount: amount,
        payment_reference: refId,
        payment_date: new Date().toISOString(),
      });
      await supabaseDb.insertPayment({
        member_id: member.id,
        membership_id: member.membership_id,
        method: 'offline',
        amount,
        status: 'Paid',
        reference_id: refId,
        razorpay_order_id: null,
        notes,
      });
    } catch (err) {
      console.error('Supabase offline payment sync error:', err);
    }
  }

  recordAuditLog({
    action: 'PAYMENT_OFFLINE_RECORDED',
    entity_type: 'payment',
    entity_id: member.membership_id,
    details: { amount, reference_id: refId, member_name: member.name },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.status(200).json({
    success: true,
    message: 'Offline payment recorded successfully.',
    payment: {
      id: pInfo.lastInsertRowid,
      membership_id: member.membership_id,
      method: 'offline',
      amount,
      status: 'Paid',
      reference_id: refId,
    },
    member: photoUrl((await getMember(member.id)) as Member),
  });
});

// 2. Submit Online Transaction ID / Reference No. (UPI, UTR, Card, NetBanking)
publicRouter.post('/payments/online/submit', async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const membershipId = qs(b.membership_id);
  const transactionId = qs(b.transaction_id) || qs(b.payment_reference) || qs(b.reference_id);
  const amount = Number(b.amount) || 0;
  const notes = qs(b.notes) || 'Online payment transaction submitted';

  if (!membershipId) {
    return res.status(400).json({ errors: ['membership_id is required.'] });
  }
  if (!transactionId) {
    return res.status(400).json({ errors: ['Transaction ID / Reference Number is required for online payment.'] });
  }

  const member = await getMember(membershipId);
  if (!member) {
    return res.status(404).json({ errors: ['Member not found.'] });
  }

  const pInfo = db.prepare(`
    INSERT INTO payments (member_id, membership_id, method, amount, status, reference_id, notes)
    VALUES (@member_id, @membership_id, 'online', @amount, 'Pending', @reference_id, @notes)
  `).run({
    member_id: member.id,
    membership_id: member.membership_id,
    amount: amount || member.payment_amount || 0,
    reference_id: transactionId,
    notes,
  });

  db.prepare(`
    UPDATE members
    SET payment_method = 'online', payment_amount = COALESCE(@amount, payment_amount),
        payment_reference = @refId, payment_date = datetime('now'), updated_at = datetime('now')
    WHERE id = @id
  `).run({ id: member.id, amount: amount || member.payment_amount || 0, refId: transactionId });

  if (isSupabaseReady()) {
    try {
      await supabaseDb.updateMember(member.id, {
        payment_method: 'online',
        payment_amount: amount || member.payment_amount || 0,
        payment_reference: transactionId,
        payment_date: new Date().toISOString(),
      });
      await supabaseDb.insertPayment({
        member_id: member.id,
        membership_id: member.membership_id,
        method: 'online',
        amount: amount || member.payment_amount || 0,
        status: 'Pending',
        reference_id: transactionId,
        razorpay_order_id: null,
        notes,
      });
    } catch (err) {
      console.error('Supabase online transaction submit error:', err);
    }
  }

  recordAuditLog({
    action: 'PAYMENT_ONLINE_TXN_SUBMITTED',
    entity_type: 'payment',
    entity_id: member.membership_id,
    details: { amount, transaction_id: transactionId, member_name: member.name },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.status(200).json({
    success: true,
    message: 'Online transaction reference submitted successfully. Your payment will be verified shortly.',
    payment: {
      id: pInfo.lastInsertRowid,
      membership_id: member.membership_id,
      method: 'online',
      amount: amount || member.payment_amount || 0,
      status: 'Pending',
      reference_id: transactionId,
    },
    member: photoUrl((await getMember(member.id)) as Member),
  });
});

// Update or switch payment method preference (online or offline)
publicRouter.patch('/members/:membership_id/payment-mode', async (req, res) => {
  const membershipId = qs(req.params.membership_id);
  const b = (req.body ?? {}) as Record<string, unknown>;
  let method = qs(b.payment_method)?.toLowerCase();
  if (method === 'cash') method = 'offline';
  const amount = b.payment_amount !== undefined && b.payment_amount !== null && b.payment_amount !== '' ? Number(b.payment_amount) : undefined;
  const ref = qs(b.payment_reference) || qs(b.transaction_id);

  if (!membershipId) {
    return res.status(400).json({ errors: ['membership_id is required.'] });
  }

  if (!method || !PAYMENT_METHODS.includes(method as 'online' | 'offline')) {
    return res.status(400).json({ errors: [`payment_method must be one of: ${PAYMENT_METHODS.join(', ')}.`] });
  }

  const member = await getMember(membershipId);
  if (!member) return res.status(404).json({ errors: ['Member not found.'] });

  const sets = ['payment_method = @method', "updated_at = datetime('now')"];
  const params: Record<string, unknown> = { id: member.id, method };
  const updateObj: Record<string, unknown> = { payment_method: method };
  if (amount !== undefined && !isNaN(amount)) {
    sets.push('payment_amount = @amount');
    params.amount = amount;
    updateObj.payment_amount = amount;
  }
  if (ref !== undefined) {
    sets.push('payment_reference = @ref');
    params.ref = ref;
    updateObj.payment_reference = ref;
  }
  db.prepare(`UPDATE members SET ${sets.join(', ')} WHERE id = @id`).run(params);

  if (isSupabaseReady()) {
    try {
      await supabaseDb.updateMember(member.id, updateObj);
    } catch (err) {
      console.error('Supabase payment-mode update error:', err);
    }
  }

  res.json({
    success: true,
    message: `Payment mode updated to ${method === 'online' ? 'Online' : 'Offline'}.`,
    member: photoUrl((await getMember(member.id)) as Member),
  });
});

// 2. Create Online Payment Order (Razorpay)
publicRouter.post('/payments/razorpay/order', async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const membershipId = qs(b.membership_id);
  const amount = Math.round(Number(b.amount || 0));
  const notes = qs(b.notes) || 'Membership fee';

  if (!membershipId) {
    return res.status(400).json({ errors: ['membership_id is required.'] });
  }
  if (!amount || amount < 1) {
    return res.status(400).json({ errors: ['Enter a valid payment amount of at least ₹1.'] });
  }

  const member = await getMember(membershipId);
  if (!member) {
    return res.status(404).json({ errors: ['Member not found.'] });
  }

  const { keyId, keySecret } = config.razorpay;
  const amountPaise = amount * 100;

  // Live or test gateway order via Razorpay API
  if (keyId && keySecret) {
    try {
      const r = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: `rcpt_${member.membership_id}_${Date.now()}`,
          notes: { membership_id: member.membership_id, member_name: member.name },
        }),
      });
      const order = await r.json() as { id: string; error?: { description?: string } };
      if (!r.ok) throw new Error(order.error?.description || 'Razorpay order creation failed.');

      db.prepare(`
        INSERT INTO payments (member_id, membership_id, method, amount, status, razorpay_order_id, notes)
        VALUES (@member_id, @membership_id, 'online', @amount, 'Pending', @razorpay_order_id, @notes)
      `).run({
        member_id: member.id,
        membership_id: member.membership_id,
        amount,
        razorpay_order_id: order.id,
        notes,
      });

      if (isSupabaseReady()) {
        try {
          await supabaseDb.insertPayment({
            member_id: member.id,
            membership_id: member.membership_id,
            method: 'online',
            amount,
            status: 'Pending',
            reference_id: null,
            razorpay_order_id: order.id,
            notes,
          });
        } catch (err) {
          console.error('Supabase online payment order sync error:', err);
        }
      }

      return res.json({
        order_id: order.id,
        amount: amountPaise,
        currency: 'INR',
        key: keyId,
        method: 'online',
        membership_id: member.membership_id,
      });
    } catch (err) {
      console.error('Razorpay order error:', (err as Error).message);
      return res.status(502).json({ errors: ['Could not create online payment order. Please try again or pay via cash.'] });
    }
  }

  // Developer simulation order when API keys are not provided in .env
  const mockOrderId = `order_mock_${Date.now()}`;
  db.prepare(`
    INSERT INTO payments (member_id, membership_id, method, amount, status, razorpay_order_id, notes)
    VALUES (@member_id, @membership_id, 'online', @amount, 'Pending', @razorpay_order_id, @notes)
  `).run({
    member_id: member.id,
    membership_id: member.membership_id,
    amount,
    razorpay_order_id: mockOrderId,
    notes: `${notes} (Mock Order - Set RAZORPAY_KEY_ID in .env for production gateway)`,
  });

  if (isSupabaseReady()) {
    try {
      await supabaseDb.insertPayment({
        member_id: member.id,
        membership_id: member.membership_id,
        method: 'online',
        amount,
        status: 'Pending',
        reference_id: null,
        razorpay_order_id: mockOrderId,
        notes: `${notes} (Mock Order)`,
      });
    } catch (err) {
      console.error('Supabase mock order sync error:', err);
    }
  }

  return res.json({
    order_id: mockOrderId,
    amount: amountPaise,
    currency: 'INR',
    key: keyId || 'rzp_test_placeholder',
    method: 'online',
    membership_id: member.membership_id,
    is_mock: true,
  });
});

// 3. Verify Online Payment (Razorpay Signature)
publicRouter.post('/payments/razorpay/verify', async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const orderId = qs(b.razorpay_order_id);
  const paymentId = qs(b.razorpay_payment_id);
  const signature = qs(b.razorpay_signature);
  const membershipId = qs(b.membership_id);

  if (!orderId || !paymentId) {
    return res.status(400).json({ errors: ['razorpay_order_id and razorpay_payment_id are required.'] });
  }

  const { keySecret } = config.razorpay;

  // Real cryptographic signature check if secret is configured
  if (keySecret && signature) {
    const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    const ok = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!ok) {
      return res.status(400).json({ errors: ['Razorpay payment signature verification failed.'] });
    }
  } else if (!orderId.startsWith('order_mock_') && !signature) {
    return res.status(400).json({ errors: ['Payment signature is required.'] });
  }

  // Find payment entry or member
  const payment = db.prepare('SELECT * FROM payments WHERE razorpay_order_id = ?').get(orderId) as PaymentRecord | undefined;
  const targetMembershipId = membershipId || payment?.membership_id;

  if (targetMembershipId) {
    db.prepare(`
      UPDATE members
      SET payment_method = 'online', payment_status = 'Paid', payment_amount = COALESCE(@amount, payment_amount),
          payment_reference = @paymentId, payment_date = datetime('now'), updated_at = datetime('now')
      WHERE membership_id = @membershipId
    `).run({
      amount: payment ? payment.amount : null,
      paymentId,
      membershipId: targetMembershipId,
    });

    if (isSupabaseReady()) {
      try {
        const mem = await getMember(targetMembershipId);
        if (mem) {
          await supabaseDb.updateMember(mem.id, {
            payment_method: 'online',
            payment_status: 'Paid',
            payment_amount: payment ? payment.amount : mem.payment_amount,
            payment_reference: paymentId,
            payment_date: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Supabase payment verify member sync error:', err);
      }
    }
  }

  if (payment) {
    db.prepare(`
      UPDATE payments
      SET status = 'Paid', reference_id = @paymentId
      WHERE id = @id
    `).run({ paymentId, id: payment.id });
  }

  recordAuditLog({
    action: 'PAYMENT_ONLINE_VERIFIED',
    entity_type: 'payment',
    entity_id: targetMembershipId ?? null,
    details: { order_id: orderId, payment_id: paymentId, amount: payment?.amount },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.json({
    success: true,
    message: 'Online Razorpay payment verified and recorded successfully.',
    payment_id: paymentId,
    order_id: orderId,
    status: 'Paid',
    method: 'online',
  });
});

// ---------- Admin (mounted behind requireAdmin) ----------
export const adminRouter = Router();

adminRouter.get('/stats', async (_req, res) => {
  await syncExpireLapsedMembers();
  if (isSupabaseReady()) {
    try {
      const stats = await supabaseDb.getStats();
      if (stats) return res.json(stats);
    } catch (err) {
      console.error('Supabase getStats error, fallback to SQLite:', err);
    }
  }
  const one = (sql: string): number => (db.prepare(sql).get() as { c: number }).c;
  res.json({
    total: one('SELECT COUNT(*) c FROM members'),
    active: one('SELECT COUNT(*) c FROM members WHERE is_active = 1'),
    inactive: one('SELECT COUNT(*) c FROM members WHERE is_active = 0'),
    pending: one(`SELECT COUNT(*) c FROM members WHERE membership_status = 'Pending'`),
    expiringIn30Days: one(`SELECT COUNT(*) c FROM members WHERE membership_status = 'Approved'
      AND date(validity_end) BETWEEN date('now') AND date('now', '+30 days')`),
  });
});

adminRouter.get('/members', async (req, res) => res.json(await list(req.query, true)));

adminRouter.get('/members/export.csv', async (req, res) => {
  let rows: Member[] = [];
  if (isSupabaseReady()) {
    try {
      const supaRes = await supabaseDb.listMembers({ adminView: true, limit: 50000, ...(req.query as Record<string, string>) });
      rows = supaRes.members as Member[];
    } catch (err) {
      console.error('Supabase export error, falling back to local SQLite:', err);
    }
  }
  if (!rows || rows.length === 0) {
    const { clause, params } = filters(req.query, true);
    rows = db.prepare(`SELECT * FROM members ${clause} ORDER BY id`).all(params) as Member[];
  }
  const cols: Array<keyof Member> = [
    'membership_id', 'name', 'designation', 'location', 'mobile', 'email', 'category',
    'validity_start', 'validity_end', 'organization', 'address', 'gender', 'date_of_birth',
    'payment_method', 'payment_status', 'payment_amount', 'payment_reference', 'payment_date',
    'is_active', 'membership_status', 'created_at'
  ];
  const esc = (v: unknown): string => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="members.csv"',
  }).send('\uFEFF' + csv);
});

adminRouter.get('/members/:id', async (req, res) => {
  const m = await getMember(req.params.id);
  m ? res.json(membershipDocumentUrls(photoUrl(m))) : res.status(404).json({ errors: ['Member not found.'] });
});

adminRouter.post('/members', withPhoto, async (req, res) => {
  const { errors, data } = validateMember(req.body);
  if (errors.length) { removePhoto(req.file?.filename); return res.status(400).json({ errors }); }
  
  const payMethod = data.payment_method ? (data.payment_method.toLowerCase() === 'cash' ? 'offline' : data.payment_method) : 'offline';
  const payStatus = data.payment_status || 'Paid';
  const payDate = data.payment_date || new Date().toISOString().split('T')[0];

  // Members added by an admin are approved and active unless stated otherwise.
  const m = await insertMember({
    ...data,
    membership_status: data.membership_status ?? 'Approved',
    is_active: data.is_active ?? 1,
    payment_method: payMethod,
    payment_status: payStatus,
    payment_date: payDate,
  }, req.file?.filename);

  // Record in payments ledger
  try {
    const payAmount = Number(data.payment_amount) || 0;
    const refId = data.payment_reference || (payMethod === 'offline' ? `CASH-${Date.now()}` : null);
    db.prepare(`
      INSERT INTO payments (member_id, membership_id, method, amount, status, reference_id, notes)
      VALUES (@member_id, @membership_id, @method, @amount, @status, @reference_id, @notes)
    `).run({
      member_id: m.id,
      membership_id: m.membership_id,
      method: payMethod,
      amount: payAmount,
      status: payStatus,
      reference_id: refId,
      notes: `Admin enrolled member (${payMethod})`,
    });

    if (isSupabaseReady()) {
      supabaseDb.insertPayment({
        member_id: m.id,
        membership_id: m.membership_id,
        method: payMethod as PaymentMethod,
        amount: payAmount,
        status: payStatus as PaymentStatus,
        reference_id: refId,
        razorpay_order_id: null,
        notes: `Admin enrolled member (${payMethod})`,
      }).catch((err: Error) => console.error('Supabase admin payment sync error:', err));
    }
  } catch (err) {
    console.error('Failed to log admin member payment ledger entry:', err);
  }

  recordAuditLog({
    admin_id: req.admin?.id,
    admin_user: req.admin?.username,
    action: 'MEMBER_CREATE',
    entity_type: 'member',
    entity_id: m.membership_id,
    details: {
      name: m.name,
      category: m.category,
      designation: m.designation,
      location: m.location,
      payment_method: payMethod,
      payment_reference: data.payment_reference,
    },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.status(201).json(photoUrl(m));
});

adminRouter.put('/members/:id', withPhoto, async (req, res) => {
  const existing = await getMember(req.params.id);
  if (!existing) { removePhoto(req.file?.filename); return res.status(404).json({ errors: ['Member not found.'] }); }
  const { errors, data } = validateMember(req.body, { partial: true });
  if (errors.length) { removePhoto(req.file?.filename); return res.status(400).json({ errors }); }
  await updateMember(existing.membership_id, data, req.file?.filename);
  if (req.file) removePhoto(existing.photo);

  // Sync payments ledger when payment info changes
  if (
    data.payment_amount !== undefined ||
    data.payment_method !== undefined ||
    data.payment_status !== undefined ||
    data.payment_reference !== undefined
  ) {
    try {
      const existingPay = db
        .prepare('SELECT id FROM payments WHERE membership_id = ? OR member_id = ? ORDER BY id DESC LIMIT 1')
        .get(existing.membership_id, existing.id) as { id: number } | undefined;
      const method = (data.payment_method as string) || existing.payment_method || 'offline';
      const status = (data.payment_status as string) || existing.payment_status || 'Paid';
      const amount = data.payment_amount !== undefined ? Number(data.payment_amount) : (existing.payment_amount || 0);
      const ref =
        data.payment_reference !== undefined
          ? (data.payment_reference as string)
          : (existing.payment_reference || (method === 'offline' ? `CASH-${Date.now()}` : null));

      if (existingPay) {
        db.prepare(
          'UPDATE payments SET method = @method, status = @status, amount = @amount, reference_id = @ref WHERE id = @id',
        ).run({ id: existingPay.id, method, status, amount, ref });
      } else if (amount > 0 || ref) {
        db.prepare(`
          INSERT INTO payments (member_id, membership_id, method, amount, status, reference_id, notes)
          VALUES (@member_id, @membership_id, @method, @amount, @status, @reference_id, @notes)
        `).run({
          member_id: existing.id,
          membership_id: existing.membership_id,
          method,
          amount,
          status,
          reference_id: ref,
          notes: `Admin updated member payment (${method})`,
        });
      }
    } catch (payErr) {
      console.error('Failed to sync payments ledger from member update:', payErr);
    }
  }

  recordAuditLog({
    admin_id: req.admin?.id,
    admin_user: req.admin?.username,
    action: 'MEMBER_UPDATE',
    entity_type: 'member',
    entity_id: existing.membership_id,
    details: data,
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.json(photoUrl((await getMember(existing.id)) as Member));
});

adminRouter.patch('/members/:id/active', async (req, res) => {
  const m = await getMember(req.params.id);
  if (!m) return res.status(404).json({ errors: ['Member not found.'] });
  const body = (req.body ?? {}) as { is_active?: unknown };
  const active = body.is_active === undefined ? !m.is_active : asFlag(body.is_active) === 1;
  const data: Record<string, unknown> = { is_active: active ? 1 : 0 };
  if (active && m.membership_status === 'Pending') data.membership_status = 'Approved'; // activating approves
  await updateMember(m.id, data);

  recordAuditLog({
    admin_id: req.admin?.id,
    admin_user: req.admin?.username,
    action: active ? 'MEMBER_ACTIVATE' : 'MEMBER_DEACTIVATE',
    entity_type: 'member',
    entity_id: m.membership_id,
    details: { is_active: active ? 1 : 0, name: m.name },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.json(photoUrl((await getMember(m.id)) as Member));
});

adminRouter.patch('/members/:id/status', async (req, res) => {
  const { membership_status } = (req.body ?? {}) as { membership_status?: string };
  if (!MEMBERSHIP_STATUSES.includes(membership_status as MembershipStatus))
    return res.status(400).json({ errors: [`Membership status must be one of: ${MEMBERSHIP_STATUSES.join(', ')}.`] });
  const m = await getMember(req.params.id);
  if (!m) return res.status(404).json({ errors: ['Member not found.'] });
  await updateMember(m.id, { membership_status });

  recordAuditLog({
    admin_id: req.admin?.id,
    admin_user: req.admin?.username,
    action: 'MEMBER_STATUS_CHANGE',
    entity_type: 'member',
    entity_id: m.membership_id,
    details: { previous: m.membership_status, next: membership_status, name: m.name },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.json(photoUrl((await getMember(m.id)) as Member));
});

adminRouter.patch('/members/:id/category', async (req, res) => {
  const { category } = (req.body ?? {}) as { category?: string };
  if (!category || !config.categories.includes(category))
    return res.status(400).json({ errors: [`Category must be one of: ${config.categories.join(', ')}.`] });
  const m = await getMember(req.params.id);
  if (!m) return res.status(404).json({ errors: ['Member not found.'] });
  await updateMember(m.id, { category });

  recordAuditLog({
    admin_id: req.admin?.id,
    admin_user: req.admin?.username,
    action: 'MEMBER_CATEGORY_CHANGE',
    entity_type: 'member',
    entity_id: m.membership_id,
    details: { previous: m.category, next: category, name: m.name },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.json(photoUrl((await getMember(m.id)) as Member));
});

// Admin update member payment directly
adminRouter.patch('/members/:id/payment', async (req, res) => {
  const m = await getMember(req.params.id);
  if (!m) return res.status(404).json({ errors: ['Member not found.'] });

  const b = (req.body ?? {}) as Record<string, unknown>;
  let method = qs(b.payment_method)?.toLowerCase() || m.payment_method || 'offline';
  if (method === 'cash') method = 'offline';
  const status = qs(b.payment_status) || 'Paid';
  const amount = b.payment_amount !== undefined ? Number(b.payment_amount) : (m.payment_amount || 0);
  const ref = qs(b.payment_reference) || (method === 'offline' ? `OFFLINE-${Date.now()}` : `ONLINE-${Date.now()}`);
  const payDate = qs(b.payment_date) || new Date().toISOString().split('T')[0];
  const notes = qs(b.notes) || 'Admin recorded payment';
  const autoActivate = b.auto_activate === true || b.auto_activate === 'true' || b.auto_activate === 1;

  if (!PAYMENT_METHODS.includes(method as 'online' | 'offline')) {
    return res.status(400).json({ errors: [`payment_method must be one of: ${PAYMENT_METHODS.join(', ')}.`] });
  }
  if (!PAYMENT_STATUSES.includes(status as PaymentStatus)) {
    return res.status(400).json({ errors: [`payment_status must be one of: ${PAYMENT_STATUSES.join(', ')}.`] });
  }

  // Update member
  const updateClauses = [
    'payment_method = @method',
    'payment_status = @status',
    'payment_amount = @amount',
    'payment_reference = @ref',
    'payment_date = @payDate',
    "updated_at = datetime('now')"
  ];
  const supaUpdate: Record<string, unknown> = {
    payment_method: method,
    payment_status: status,
    payment_amount: amount,
    payment_reference: ref,
    payment_date: payDate,
  };
  if (autoActivate && status === 'Paid') {
    updateClauses.push('is_active = 1', "membership_status = 'Approved'");
    supaUpdate.is_active = 1;
    supaUpdate.membership_status = 'Approved';
  }

  db.prepare(`
    UPDATE members
    SET ${updateClauses.join(', ')}
    WHERE id = @id
  `).run({ id: m.id, method, status, amount, ref, payDate });

  // Record payment history entry
  db.prepare(`
    INSERT INTO payments (member_id, membership_id, method, amount, status, reference_id, notes)
    VALUES (@member_id, @membership_id, @method, @amount, @status, @reference_id, @notes)
  `).run({
    member_id: m.id,
    membership_id: m.membership_id,
    method,
    amount,
    status,
    reference_id: ref,
    notes,
  });

  if (isSupabaseReady()) {
    try {
      await supabaseDb.updateMember(m.id, supaUpdate);
      await supabaseDb.insertPayment({
        member_id: m.id,
        membership_id: m.membership_id,
        method: method as PaymentMethod,
        amount,
        status: status as PaymentStatus,
        reference_id: ref,
        razorpay_order_id: null,
        notes,
      });
    } catch (err) {
      console.error('Supabase admin payment update error:', err);
    }
  }

  recordAuditLog({
    admin_id: req.admin?.id,
    admin_user: req.admin?.username,
    action: 'MEMBER_PAYMENT_UPDATE',
    entity_type: 'payment',
    entity_id: m.membership_id,
    details: { method, status, amount, reference_id: ref, auto_activate: autoActivate },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.json(photoUrl((await getMember(m.id)) as Member));
});

// Admin update an existing payment ledger entry
adminRouter.patch('/payments/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id) as PaymentRecord | undefined;
  if (!p) return res.status(404).json({ errors: ['Payment record not found.'] });

  const b = (req.body ?? {}) as Record<string, unknown>;
  const method = qs(b.method)?.toLowerCase() || p.method;
  const status = qs(b.status) || p.status;
  const amount = b.amount !== undefined ? Number(b.amount) : p.amount;
  const ref = qs(b.reference_id) ?? p.reference_id;
  const notes = qs(b.notes) ?? p.notes;

  db.prepare(`
    UPDATE payments
    SET method = @method, status = @status, amount = @amount, reference_id = @ref, notes = @notes
    WHERE id = @id
  `).run({ id: p.id, method, status, amount, ref, notes });

  recordAuditLog({
    admin_id: req.admin?.id,
    admin_user: req.admin?.username,
    action: 'PAYMENT_LEDGER_UPDATE',
    entity_type: 'payment',
    entity_id: p.membership_id,
    details: { payment_id: p.id, method, status, amount, reference_id: ref },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.json({ success: true, message: 'Payment record updated.' });
});

// Admin view all payment transactions
adminRouter.get('/payments', (req, res) => {
  let method = qs(req.query.method)?.toLowerCase();
  if (method === 'cash') method = 'offline';
  const status = qs(req.query.status);
  const q = qs(req.query.q);

  const where: string[] = [];
  const params: Record<string, unknown> = {};

  if (method === 'offline') {
    where.push("(p.method = 'offline' OR p.method = 'cash')");
  } else if (method) {
    where.push('p.method = @method');
    params.method = method;
  }
  if (status) { where.push('p.status = @status'); params.status = status; }
  if (q) {
    where.push('(p.membership_id LIKE @q OR p.reference_id LIKE @q OR m.name LIKE @q)');
    params.q = `%${q}%`;
  }

  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const rows = db.prepare(`
    SELECT p.*, m.name as member_name, m.email as member_email
    FROM payments p
    LEFT JOIN members m ON p.member_id = m.id
    ${clause}
    ORDER BY p.id DESC
    LIMIT 200
  `).all(params);

  res.json({ total: rows.length, payments: rows });
});

adminRouter.delete('/members/:id', async (req, res) => {
  const m = await getMember(req.params.id);
  if (!m) return res.status(404).json({ errors: ['Member not found.'] });

  if (isSupabaseReady()) {
    try {
      await supabaseDb.deleteMember(m.membership_id);
    } catch (err) {
      console.error('Supabase delete member error:', err);
    }
  }

  db.prepare('DELETE FROM members WHERE id = ? OR membership_id = ?').run(m.id, m.membership_id);
  db.prepare('DELETE FROM payments WHERE member_id = ? OR membership_id = ?').run(m.id, m.membership_id);
  removePhoto(m.photo);

  recordAuditLog({
    admin_id: req.admin?.id,
    admin_user: req.admin?.username,
    action: 'MEMBER_DELETE',
    entity_type: 'member',
    entity_id: m.membership_id,
    details: { name: m.name, category: m.category },
    ip_address: getClientIp(req),
    user_agent: getUserAgent(req),
  });

  res.json({ message: 'Member deleted.' });
});

// Admin view audit logs
adminRouter.get('/audit-logs', (req, res) => {
  const page = Math.max(1, parseInt(qs(req.query.page) ?? '') || 1);
  const limit = Math.min(100, Math.max(1, parseInt(qs(req.query.limit) ?? '') || 50));
  const action = qs(req.query.action);
  const adminUser = qs(req.query.admin_user);
  const entityType = qs(req.query.entity_type);
  const q = qs(req.query.q);

  const where: string[] = [];
  const params: Record<string, unknown> = {};

  if (action) { where.push('action = @action'); params.action = action; }
  if (adminUser) { where.push('admin_user = @adminUser'); params.adminUser = adminUser; }
  if (entityType) { where.push('entity_type = @entityType'); params.entityType = entityType; }
  if (q) {
    where.push('(action LIKE @q OR entity_id LIKE @q OR admin_user LIKE @q OR details LIKE @q)');
    params.q = `%${q}%`;
  }

  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = (db.prepare(`SELECT COUNT(*) c FROM audit_logs ${clause}`).get(params) as { c: number }).c;
  const rows = db.prepare(`
    SELECT * FROM audit_logs ${clause} ORDER BY id DESC LIMIT @limit OFFSET @offset
  `).all({ ...params, limit, offset: (page - 1) * limit });

  res.json({
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    logs: rows,
  });
});

// Admin generate and download a consistent point-in-time database backup snapshot
adminRouter.get('/backup', (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const tempDir = os.tmpdir();
  const backupFileName = `membership-backup-${timestamp}.sqlite`;
  const backupFilePath = path.join(tempDir, backupFileName);

  try {
    if (fs.existsSync(backupFilePath)) {
      fs.unlinkSync(backupFilePath);
    }

    // VACUUM INTO creates a transactionally consistent copy of the database
    // Normalize path with forward slashes for SQLite string literal
    const safePath = backupFilePath.replace(/\\/g, '/');
    rawDb.exec(`VACUUM INTO '${safePath}'`);

    recordAuditLog({
      admin_id: req.admin?.id,
      admin_user: req.admin?.username,
      action: 'DATABASE_BACKUP_DOWNLOAD',
      entity_type: 'database',
      details: { filename: backupFileName },
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req),
    });

    res.download(backupFilePath, backupFileName, (err) => {
      // Clean up temporary backup file after download
      try {
        if (fs.existsSync(backupFilePath)) fs.unlinkSync(backupFilePath);
      } catch {}
      if (err && !res.headersSent) {
        res.status(500).json({ errors: ['Failed to stream database backup snapshot.'] });
      }
    });
  } catch (err) {
    console.error('Database backup snapshot failed:', err);
    res.status(500).json({ errors: ['Could not create database backup snapshot.'] });
  }
});
