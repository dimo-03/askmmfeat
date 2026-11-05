export interface SiteInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  mapsEmbedUrl?: string;
  social: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    x?: string;
  };
  donationsEnabled: boolean;
  razorpayKeyId?: string;
  stats?: {
    events: number;
    beneficiaries: number;
  };
}

export interface SiteConfig {
  categories: string[];
  membershipStatuses: string[];
  paymentMethods: string[];
  paymentStatuses: string[];
  razorpay: {
    enabled: boolean;
    keyId: string;
  };
}

export interface ApiTeamMember {
  id: number;
  name: string;
  designation: string | null;
  bio: string | null;
  photo: string | null;
  sort_order: number;
}

export interface ApiEventItem {
  id: number;
  title: string;
  category: string | null;
  event_date: string | null;
  description: string | null;
  beneficiaries: number;
  photo: string | null;
}

export interface ApiGalleryItem {
  id: number;
  caption: string | null;
  album: string | null;
  photo: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  website?: string; // honeypot
}

export interface ContactResponse {
  message: string;
}

export interface PublicMember {
  id: number;
  membership_id: string;
  name: string;
  photo: string | null;
  designation: string | null;
  location: string | null;
  category: string;
  is_active: 0 | 1;
  membership_status: string;
  validity_start: string | null;
  validity_end: string | null;
  organization: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  payment_amount?: number | null;
  payment_reference?: string | null;
  payment_date?: string | null;
}

export interface MemberListResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  members: PublicMember[];
}

export interface MemberQueryParams {
  [key: string]: unknown;
  q?: string;
  category?: string;
  location?: string;
  membership_status?: string;
  payment_method?: string;
  payment_status?: string;
  active?: '0' | '1' | number;
  sort?: 'name' | 'newest' | 'validity' | string;
  page?: number;
  limit?: number;
}

export interface MemberRegistrationResponse {
  message: string;
  membership_id: string;
  payment_method?: string;
  payment_status?: string;
}

export interface DonationOrderInput {
  amount: number; // in INR rupees
  name: string;
  email: string;
  phone?: string;
  pan?: string;
  message?: string;
}

export interface DonationOrderResponse {
  order_id: string;
  amount: number; // in paise
  key: string;
}

export interface DonationVerifyInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface DonationVerifyResponse {
  success: boolean;
  message: string;
  payment_id: string;
}

export interface AdminLoginInput {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  username: string;
}

export interface AdminStats {
  total: number;
  active: number;
  pending: number;
  expired: number;
  suspended: number;
  newThisMonth: number;
  byCategory: Record<string, number>;
  payments: {
    total_paid_amount: number;
    paid_count: number;
    pending_count: number;
    by_method: Record<string, number>;
  };
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  uptime_seconds?: number;
  timestamp?: string;
  database?: {
    status: string;
    total_members?: number;
  };
}

export interface FullMember extends PublicMember {
  mobile?: string;
  email?: string;
  address?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  notes?: string | null;
  payment_amount?: number | null;
  payment_reference?: string | null;
  payment_date?: string | null;
  created_at?: string;
  updated_at?: string;
  pan_number?: string | null;
  aadhaar_number?: string | null;
  pan_card?: string | null;
  aadhaar_card?: string | null;
}

export interface PaymentRecord {
  id: number;
  member_id: number | null;
  membership_id: string | null;
  member_name?: string | null;
  method: string;
  amount: number;
  status: string;
  reference_id: string | null;
  razorpay_order_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface MemberNotification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: 0 | 1;
  read_at: string | null;
}

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: 0 | 1;
  created_at: string;
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
