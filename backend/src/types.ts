export const MEMBERSHIP_STATUSES = ['Pending', 'Approved', 'Suspended', 'Expired'] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const PAYMENT_METHODS = ['online', 'offline'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number] | 'cash';

export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface Member {
  id: number;
  membership_id: string;
  name: string;
  photo: string | null;
  designation: string | null;
  location: string | null;
  mobile: string;
  email: string;
  category: string;
  validity_start: string | null;
  validity_end: string | null;
  organization: string | null;
  address: string | null;
  gender: string | null;
  date_of_birth: string | null;
  notes: string | null;
  is_active: 0 | 1;
  membership_status: MembershipStatus;
  payment_method?: PaymentMethod | string | null;
  payment_status?: PaymentStatus | string | null;
  payment_amount?: number | null;
  payment_reference?: string | null;
  payment_date?: string | null;
  pan_number?: string | null;
  aadhaar_number?: string | null;
  pan_card?: string | null;
  aadhaar_card?: string | null;
  created_at: string;
  updated_at: string;
}

/** Fields shown in the public directory. */
export type PublicMember = Pick<Member,
  'id' | 'membership_id' | 'name' | 'photo' | 'designation' | 'location' | 'category' | 'is_active' | 'membership_status' | 'validity_start' | 'validity_end' | 'organization'>;

export interface PaymentRecord {
  id: number;
  member_id: number | null;
  membership_id: string | null;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference_id: string | null;
  razorpay_order_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface TeamMember { id: number; name: string; designation: string | null; bio: string | null; photo: string | null; sort_order: number }
export interface EventItem { id: number; title: string; category: string | null; event_date: string | null; description: string | null; beneficiaries: number; photo: string | null }
export interface GalleryItem { id: number; caption: string | null; album: string | null; photo: string }
export interface Enquiry { id: number; name: string; email: string; phone: string | null; message: string; is_read: 0 | 1; created_at: string }
export interface Donation {
  id: number; order_id: string; payment_id: string | null; amount_paise: number; name: string; email: string;
  phone: string | null; pan: string | null; message: string | null; status: 'created' | 'paid'; created_at: string;
}

export interface AdminToken {
  id: number;
  username: string;
  jti?: string;
  exp?: number;
  iat?: number;
}

export interface AuditLog {
  id: number;
  admin_id: number | null;
  admin_user: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface RevokedToken {
  jti: string;
  admin_id: number;
  expires_at: number;
  created_at: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { admin?: AdminToken }
  }
}
