import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

// Ensure backend/.env is loaded even when running commands from root workspace
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const env = process.env;
const list = (v: string | undefined, fallback: string): string[] =>
  (v || fallback).split(',').map(s => s.trim()).filter(Boolean);

const secretIsSet = !!env.JWT_SECRET && !env.JWT_SECRET.startsWith('change-this');
if (!secretIsSet) {
  if (env.NODE_ENV === 'production') throw new Error('Set a strong JWT_SECRET before running in production.');
  console.warn('WARNING: set a strong JWT_SECRET in .env before going live.');
}

export const config = {
  port: Number(env.PORT) || 3000,
  jwtSecret: secretIsSet ? (env.JWT_SECRET as string) : 'dev-only-secret',
  adminUsername: env.ADMIN_USERNAME || 'admin',
  adminPassword: env.ADMIN_PASSWORD || 'ChangeMe123!',
  memberIdPrefix: env.MEMBER_ID_PREFIX || 'MEM',
  categories: list(env.MEMBERSHIP_CATEGORIES, 'Life,Annual,Student,Corporate,Honorary'),
  corsOrigins: list(env.CORS_ORIGIN, '*'),
  baseUrl: (env.PUBLIC_BASE_URL || '').replace(/\/$/, ''),
  site: {
    name: env.FOUNDATION_NAME || 'Our Foundation',
    phone: env.CONTACT_PHONE || '',
    email: env.CONTACT_EMAIL || '',
    address: env.CONTACT_ADDRESS || '',
    mapsEmbedUrl: env.MAPS_EMBED_URL || '',
    social: {
      instagram: env.SOCIAL_INSTAGRAM || '',
      facebook: env.SOCIAL_FACEBOOK || '',
      youtube: env.SOCIAL_YOUTUBE || '',
      x: env.SOCIAL_X || '',
    },
  },
  razorpay: { keyId: env.RAZORPAY_KEY_ID || '', keySecret: env.RAZORPAY_KEY_SECRET || '' },
  supabase: {
    url: env.SUPABASE_URL || '',
    key: env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || '',
    enabled: !!(env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY)),
  },
} as const;
