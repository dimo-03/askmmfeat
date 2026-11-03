import { config } from './config';
import { sanitizeText } from './middleware';
import { MEMBERSHIP_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from './types';
import type { MembershipStatus, PaymentMethod, PaymentStatus } from './types';

const TEXT_FIELDS = [
  'name', 'designation', 'location', 'mobile', 'email', 'category', 'validity_start',
  'validity_end', 'organization', 'address', 'gender', 'date_of_birth', 'notes',
  'membership_status', 'payment_method', 'payment_status', 'payment_reference', 'payment_date'
  , 'pan_number', 'aadhaar_number', 'pan_card', 'aadhaar_card'
] as const;
type TextField = (typeof TEXT_FIELDS)[number];

export type MemberInput = Partial<Record<Exclude<TextField, 'membership_status'>, string>> & {
  membership_status?: MembershipStatus;
  is_active?: 0 | 1;
  payment_amount?: number;
};

export interface Validated { errors: string[]; data: MemberInput }

const isDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
export const asFlag = (v: unknown): 0 | 1 => ([true, 1, '1', 'true', 'on'].includes(v as never) ? 1 : 0);

/** partial = true for edits: only fields present in the body are checked. */
export function validateMember(body: Record<string, unknown> = {}, { partial = false } = {}): Validated {
  const errors: string[] = [];
  const d: Record<string, string | number> = {};
  for (const f of TEXT_FIELDS) if (body[f] !== undefined && body[f] !== null) d[f] = sanitizeText(body[f]);
  if (body.is_active !== undefined) d.is_active = asFlag(body.is_active);
  if (body.payment_amount !== undefined && body.payment_amount !== null && body.payment_amount !== '') {
    const amt = Number(body.payment_amount);
    if (isNaN(amt) || amt < 0) {
      errors.push('Payment amount must be a positive number.');
    } else if (amt > 99999999) {
      errors.push('Payment amount cannot exceed ₹9,99,99,999.');
    } else {
      d.payment_amount = amt;
    }
  }

  const str = (k: string): string => (typeof d[k] === 'string' ? (d[k] as string) : '');
  const need = (k: string): boolean => !partial || d[k] !== undefined;

  if (need('name') && !str('name')) errors.push('Name is required.');
  if (need('mobile') && !/^[+]?[0-9\s-]{7,15}$/.test(str('mobile'))) errors.push('Enter a valid mobile number.');
  if (need('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str('email'))) errors.push('Enter a valid email address.');
  if (need('pan_number') && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(str('pan_number').toUpperCase()))
    errors.push('Enter a valid PAN number in the format ABCDE1234F.');
  if (need('aadhaar_number') && !/^[2-9][0-9]{11}$/.test(str('aadhaar_number').replace(/\s/g, '')))
    errors.push('Enter a valid 12-digit Aadhaar number.');
  if (need('category') && !config.categories.includes(str('category')))
    errors.push(`Category must be one of: ${config.categories.join(', ')}.`);
  for (const f of ['validity_start', 'validity_end', 'date_of_birth'])
    if (str(f) && !isDate(str(f))) errors.push(`${f} must be a date in YYYY-MM-DD format.`);
  if (str('validity_start') && str('validity_end') && str('validity_end') < str('validity_start'))
    errors.push('Validity end must be after validity start.');
  if (str('membership_status') && !MEMBERSHIP_STATUSES.includes(str('membership_status') as MembershipStatus))
    errors.push(`Membership status must be one of: ${MEMBERSHIP_STATUSES.join(', ')}.`);
  if (str('payment_method')) {
    let pm = str('payment_method').toLowerCase();
    if (pm === 'cash') pm = 'offline';
    if (!PAYMENT_METHODS.includes(pm as 'online' | 'offline')) {
      errors.push(`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}.`);
    } else {
      d.payment_method = pm;
    }
  }
  if (str('payment_status') && !PAYMENT_STATUSES.includes(str('payment_status') as PaymentStatus))
    errors.push(`Payment status must be one of: ${PAYMENT_STATUSES.join(', ')}.`);

  return { errors, data: d as MemberInput };
}
