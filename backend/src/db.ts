import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { isSupabaseReady, supabaseDb } from './supabase';

export const rawDb = new DatabaseSync(path.join(__dirname, '..', 'data.sqlite'));

export interface StatementResult {
  changes: number;
  lastInsertRowid: number;
}

export interface StatementWrapper {
  get: (...args: unknown[]) => unknown;
  all: (...args: unknown[]) => unknown[];
  run: (...args: unknown[]) => StatementResult;
}

export interface DbWrapper {
  exec: (sql: string) => void;
  pragma: (sql: string) => void;
  prepare: (sql: string) => StatementWrapper;
}

function createDbWrapper(raw: DatabaseSync): DbWrapper {
  return {
    exec(sql: string) {
      raw.exec(sql);
    },
    pragma(sql: string) {
      raw.exec(`PRAGMA ${sql};`);
    },
    prepare(sql: string): StatementWrapper {
      const stmt = raw.prepare(sql);
      const namedParams = (sql.match(/[@:$]([a-zA-Z0-9_]+)/g) || []).map(p => p.slice(1));

      const filterParams = (obj: Record<string, unknown>): Record<string, unknown> => {
        const clean: Record<string, unknown> = {};
        for (const p of namedParams) {
          if (p in obj) {
            clean[p] = obj[p] ?? null;
          }
        }
        return clean;
      };

      const normalizeArgs = (args: unknown[]): unknown[] => {
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
          if (namedParams.length === 0) return [];
          return [filterParams(args[0] as Record<string, unknown>)];
        }
        return args;
      };

      return {
        get(...args: unknown[]) {
          const norm = normalizeArgs(args);
          return (stmt.get as (...a: unknown[]) => unknown)(...norm);
        },
        all(...args: unknown[]) {
          const norm = normalizeArgs(args);
          return (stmt.all as (...a: unknown[]) => unknown[])(...norm);
        },
        run(...args: unknown[]): StatementResult {
          const norm = normalizeArgs(args);
          const res = (stmt.run as (...a: unknown[]) => { changes: number; lastInsertRowid: number | bigint })(...norm);
          return {
            changes: Number(res.changes),
            lastInsertRowid: Number(res.lastInsertRowid),
          };
        },
      };
    },
  };
}

export const db = createDbWrapper(rawDb);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS members (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  membership_id     TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  photo             TEXT,
  designation       TEXT,
  location          TEXT,
  mobile            TEXT NOT NULL,
  email             TEXT NOT NULL,
  category          TEXT NOT NULL,
  validity_start    TEXT,
  validity_end      TEXT,
  organization      TEXT,
  address           TEXT,
  gender            TEXT,
  date_of_birth     TEXT,
  notes             TEXT,
  is_active         INTEGER NOT NULL DEFAULT 0,
  membership_status TEXT NOT NULL DEFAULT 'Pending',
  payment_method    TEXT DEFAULT 'cash',
  payment_status    TEXT DEFAULT 'Pending',
  payment_amount    REAL DEFAULT 0,
  payment_reference TEXT,
  payment_date      TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_category ON members(category);
CREATE INDEX IF NOT EXISTS idx_members_location ON members(location);

CREATE TABLE IF NOT EXISTS payments (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id          INTEGER,
  membership_id      TEXT,
  method             TEXT NOT NULL,
  amount             REAL NOT NULL,
  status             TEXT NOT NULL DEFAULT 'Pending',
  reference_id       TEXT,
  razorpay_order_id  TEXT,
  notes              TEXT,
  created_at         TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_membership_id ON payments(membership_id);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS member_accounts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  mobile        TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS team (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, designation TEXT, bio TEXT,
  photo TEXT, sort_order INTEGER DEFAULT 100);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT, event_date TEXT,
  description TEXT, beneficiaries INTEGER DEFAULT 0, photo TEXT);
CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT, caption TEXT, album TEXT, photo TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
  message TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT UNIQUE, payment_id TEXT,
  amount_paise INTEGER NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
  pan TEXT, message TEXT, status TEXT DEFAULT 'created', created_at TEXT DEFAULT (datetime('now')));

CREATE TABLE IF NOT EXISTS audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id    INTEGER,
  admin_user  TEXT,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  details     TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user ON audit_logs(admin_user);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti         TEXT PRIMARY KEY,
  admin_id    INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires ON revoked_tokens(expires_at);

CREATE TABLE IF NOT EXISTS notifications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  audience    TEXT NOT NULL DEFAULT 'all',
  category    TEXT,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notification_recipients (
  notification_id INTEGER NOT NULL,
  member_account_id INTEGER NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  read_at TEXT,
  PRIMARY KEY (notification_id, member_account_id),
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (member_account_id) REFERENCES member_accounts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_account ON notification_recipients(member_account_id, is_read);
`);

// Migration for existing tables: safely add payment columns if missing
for (const col of [
  'payment_method TEXT DEFAULT "cash"',
  'payment_status TEXT DEFAULT "Pending"',
  'payment_amount REAL DEFAULT 0',
  'payment_reference TEXT',
  'payment_date TEXT',
  'pan_number TEXT',
  'aadhaar_number TEXT',
  'pan_card TEXT',
  'aadhaar_card TEXT',
]) {
  try {
    db.exec(`ALTER TABLE members ADD COLUMN ${col};`);
  } catch {}
}

export function seedAdmin(): void {
  const { adminUsername: u, adminPassword: p } = config;
  if (!db.prepare('SELECT 1 FROM admins WHERE username = ?').get(u)) {
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(u, bcrypt.hashSync(p, 10));
    console.log(`Admin user "${u}" created.`);
  }
}

export function seedSampleMembers(): void {
  const currentYear = new Date().getFullYear();
  const sampleMembers = [
    {
      membership_id: `${config.memberIdPrefix}-${currentYear}-0001`,
      name: 'Dibyajyoti Mohanty',
      designation: 'Senior Technology Consultant',
      organization: 'Digital Innovations Lab',
      location: 'Bhubaneswar, Odisha',
      mobile: '+91 98765 43210',
      email: 'dibyajyoti@example.com',
      category: 'Life',
      validity_start: `${currentYear}-01-01`,
      validity_end: `${currentYear + 20}-12-31`,
      gender: 'Male',
      date_of_birth: '1990-05-15',
      address: 'Plot 102, Infocity Road, Patia, Bhubaneswar',
      notes: 'Founding member & advisor',
      is_active: 1,
      membership_status: 'Approved',
    },
    {
      membership_id: `${config.memberIdPrefix}-${currentYear}-0002`,
      name: 'Dr. Ananya Ray',
      designation: 'Research Fellow & Professor',
      organization: 'National Institute of Science',
      location: 'Cuttack, Odisha',
      mobile: '+91 98123 45678',
      email: 'ananya.ray@example.org',
      category: 'Annual',
      validity_start: `${currentYear}-01-01`,
      validity_end: `${currentYear + 1}-01-01`,
      gender: 'Female',
      date_of_birth: '1988-11-20',
      address: 'Sector 9, CDA, Cuttack',
      notes: 'Active in scientific community events',
      is_active: 1,
      membership_status: 'Approved',
    },
    {
      membership_id: `${config.memberIdPrefix}-${currentYear}-0003`,
      name: 'Rajesh Kumar Sharma',
      designation: 'Managing Director',
      organization: 'Pinnacle Enterprises',
      location: 'Rourkela, Odisha',
      mobile: '+91 94370 12345',
      email: 'rajesh.sharma@pinnacle.com',
      category: 'Corporate',
      validity_start: `${currentYear}-02-15`,
      validity_end: `${currentYear + 2}-02-14`,
      gender: 'Male',
      date_of_birth: '1982-08-10',
      address: 'Civil Township, Rourkela',
      notes: 'Corporate sponsor',
      is_active: 1,
      membership_status: 'Approved',
    },
    {
      membership_id: `${config.memberIdPrefix}-${currentYear}-0004`,
      name: 'Sneha Priyadarshini',
      designation: 'Postgraduate Scholar',
      organization: 'Utkal University',
      location: 'Bhubaneswar, Odisha',
      mobile: '+91 82490 67890',
      email: 'sneha.p@example.edu',
      category: 'Student',
      validity_start: `${currentYear}-06-01`,
      validity_end: `${currentYear + 1}-05-31`,
      gender: 'Female',
      date_of_birth: '2001-03-25',
      address: 'Vani Vihar, Bhubaneswar',
      notes: 'Student coordinator',
      is_active: 1,
      membership_status: 'Approved',
    },
    {
      membership_id: `${config.memberIdPrefix}-${currentYear}-0005`,
      name: 'Amitav Das',
      designation: 'Architect & Urban Planner',
      organization: 'Urban Habitat Studio',
      location: 'Puri, Odisha',
      mobile: '+91 97760 99887',
      email: 'amitav.das@example.com',
      category: 'Annual',
      validity_start: `${currentYear}-03-01`,
      validity_end: `${currentYear + 1}-02-28`,
      gender: 'Male',
      date_of_birth: '1992-09-18',
      address: 'VIP Road, Puri',
      notes: 'New applicant awaiting review',
      is_active: 0,
      membership_status: 'Pending',
    },
  ];

  for (const m of sampleMembers) {
    const existsByName = db.prepare('SELECT id FROM members WHERE name = ?').get(m.name);
    if (!existsByName) {
      const existsById = db.prepare('SELECT id FROM members WHERE membership_id = ?').get(m.membership_id);
      const row = {
        ...m,
        membership_id: existsById ? nextMembershipId() : m.membership_id,
      };
      const cols = Object.keys(row);
      db.prepare(`INSERT INTO members (${cols.join(',')}) VALUES (${cols.map(c => '@' + c).join(',')})`).run(row);
    }
  }
  console.log(`Seeded ${sampleMembers.length} sample members.`);
}

export function seedSampleContent(): void {
  const teamCount = (db.prepare('SELECT COUNT(*) c FROM team').get() as { c: number }).c;
  if (teamCount === 0) {
    const sampleTeam = [
      { name: 'Dr. S. K. Mohapatra', designation: 'Chairman', bio: 'Former senior jurist and social advocate leading the Foundation’s mission.', sort_order: 1 },
      { name: 'Prof. R. N. Mishra', designation: 'Secretary', bio: 'Educationist and social reformer managing operations and outreach.', sort_order: 2 },
      { name: 'Adv. Minati Jena', designation: 'Trustee', bio: 'Legal advisor ensuring statutory compliance and human rights advocacy.', sort_order: 3 },
      { name: 'Er. Ashok Tripathy', designation: 'Trustee', bio: 'Directing vocational skills and youth empowerment initiatives.', sort_order: 4 },
      { name: 'Prabhat Patnaik', designation: 'Treasurer', bio: 'Financial auditor overseeing fiduciary compliance and annual audits.', sort_order: 5 },
      { name: 'Sunita Mohanty', designation: 'Joint Secretary', bio: 'Coordinating student welfare drives and community health camps.', sort_order: 6 },
    ];
    for (const t of sampleTeam) {
      db.prepare('INSERT INTO team (name, designation, bio, sort_order) VALUES (?, ?, ?, ?)').run(t.name, t.designation, t.bio, t.sort_order);
    }
  }

  const eventsCount = (db.prepare('SELECT COUNT(*) c FROM events').get() as { c: number }).c;
  if (eventsCount === 0) {
    const sampleEvents = [
      { title: 'Community Awareness Drive', category: 'Social Activities', event_date: '2026-11-15', description: 'A community awareness session on rights, education and social responsibility.', beneficiaries: 250 },
      { title: 'Educational Support Programme', category: 'Educational Initiatives', event_date: '2026-11-28', description: 'A learning support session for students, with guidance and learning resources.', beneficiaries: 180 },
      { title: 'Vocational Training Workshop', category: 'Training and Skill Development', event_date: '2026-12-05', description: 'A hands-on workshop introducing practical skills to youth and community members.', beneficiaries: 95 },
      { title: 'Legal Rights Awareness Session', category: 'Justice and Legal Awareness', event_date: '2026-10-10', description: 'An awareness session explaining everyday legal rights to citizens.', beneficiaries: 320 },
      { title: 'Health Awareness Camp', category: 'Welfare Programmes', event_date: '2026-09-20', description: 'A community health-awareness camp focused on preventive care.', beneficiaries: 400 },
    ];
    for (const e of sampleEvents) {
      db.prepare('INSERT INTO events (title, category, event_date, description, beneficiaries) VALUES (?, ?, ?, ?, ?)').run(e.title, e.category, e.event_date, e.description, e.beneficiaries);
    }
  }

  const galleryCount = (db.prepare('SELECT COUNT(*) c FROM gallery').get() as { c: number }).c;
  if (galleryCount === 0) {
    const sampleGallery = [
      { caption: 'Classroom learning session', album: 'Educational Programmes', photo: 'sample-edu-1.jpg' },
      { caption: 'Reading support and library books', album: 'Educational Programmes', photo: 'sample-edu-2.jpg' },
      { caption: 'Volunteers organising relief supplies', album: 'Welfare Programmes', photo: 'sample-welfare-1.jpg' },
      { caption: 'Community health checkup camp', album: 'Welfare Programmes', photo: 'sample-welfare-2.jpg' },
      { caption: 'Hands-on technical training', album: 'Workshops and Training', photo: 'sample-training-1.jpg' },
      { caption: 'Legal rights awareness seminar', album: 'Social Activities', photo: 'sample-social-1.jpg' },
    ];
    for (const g of sampleGallery) {
      db.prepare('INSERT INTO gallery (caption, album, photo) VALUES (?, ?, ?)').run(g.caption, g.album, g.photo);
    }
  }
}

/** IDs look like MEM-2026-0001; the sequence restarts each year. */
export function nextMembershipId(): string {
  const year = new Date().getFullYear();
  const row = db.prepare('SELECT membership_id FROM members WHERE membership_id LIKE ? ORDER BY membership_id DESC LIMIT 1')
    .get(`${config.memberIdPrefix}-${year}-%`) as { membership_id: string } | undefined;
  const n = row ? parseInt(row.membership_id.split('-')[2], 10) + 1 : 1;
  return `${config.memberIdPrefix}-${year}-${String(n).padStart(4, '0')}`;
}

/** Members whose validity date has passed automatically become Expired and Inactive (is_active = 0). */
export function expireLapsedMembers(): number {
  const result = db.prepare(`
    UPDATE members
    SET is_active = 0, membership_status = 'Expired', updated_at = datetime('now')
    WHERE validity_end IS NOT NULL
      AND validity_end <> ''
      AND date(validity_end) < date('now')
      AND (is_active = 1 OR membership_status <> 'Expired')
  `).run();
  return result.changes;
}

/** Record an immutable audit log for administrative, authentication, or payment actions. */
export function recordAuditLog(entry: {
  admin_id?: number | null;
  admin_user?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | number | null;
  details?: string | Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}): void {
  try {
    const detailsStr = typeof entry.details === 'object' && entry.details !== null
      ? JSON.stringify(entry.details)
      : (entry.details ? String(entry.details) : null);

    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_user, action, entity_type, entity_id, details, ip_address, user_agent)
      VALUES (@admin_id, @admin_user, @action, @entity_type, @entity_id, @details, @ip_address, @user_agent)
    `).run({
      admin_id: entry.admin_id ?? null,
      admin_user: entry.admin_user ?? null,
      action: entry.action,
      entity_type: entry.entity_type ?? null,
      entity_id: entry.entity_id != null ? String(entry.entity_id) : null,
      details: detailsStr,
      ip_address: entry.ip_address ?? null,
      user_agent: entry.user_agent ? entry.user_agent.slice(0, 255) : null,
    });

    if (isSupabaseReady()) {
      supabaseDb.recordAudit({
        admin_id: entry.admin_id ?? null,
        admin_user: entry.admin_user ?? null,
        action: entry.action,
        entity_type: entry.entity_type ?? null,
        entity_id: entry.entity_id != null ? String(entry.entity_id) : null,
        details: detailsStr,
        ip_address: entry.ip_address ?? null,
        user_agent: entry.user_agent ? entry.user_agent.slice(0, 255) : null,
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

/** Check if a JWT jti has been revoked. */
export function isTokenRevoked(jti: string): boolean {
  if (!jti) return false;
  try {
    const row = db.prepare('SELECT 1 FROM revoked_tokens WHERE jti = ?').get(jti);
    return !!row;
  } catch {
    return false;
  }
}

/** Blacklist / revoke a JWT by its unique jti claim. */
export function revokeToken(jti: string, adminId: number, expiresAt: number): void {
  if (!jti) return;
  try {
    db.prepare('INSERT OR IGNORE INTO revoked_tokens (jti, admin_id, expires_at) VALUES (?, ?, ?)').run(jti, adminId, expiresAt);
  } catch (err) {
    console.error('Failed to revoke token:', err);
  }
}

/** Prune expired entries from revoked_tokens to keep table light. */
export function pruneExpiredRevokedTokens(): void {
  try {
    const nowEpoch = Math.floor(Date.now() / 1000);
    db.prepare('DELETE FROM revoked_tokens WHERE expires_at < ?').run(nowEpoch);
  } catch (err) {
    console.error('Failed to prune revoked tokens:', err);
  }
}
