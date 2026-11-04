import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type {
  AdminLoginInput,
  AdminLoginResponse,
  AdminStats,
  ApiEventItem,
  ApiGalleryItem,
  ApiTeamMember,
  AuditLog,
  ContactResponse,
  ContactSubmission,
  DonationOrderInput,
  DonationOrderResponse,
  DonationVerifyInput,
  DonationVerifyResponse,
  Enquiry,
  FullMember,
  HealthResponse,
  MemberListResponse,
  MemberQueryParams,
  MemberRegistrationResponse,
  MemberNotification,
  PaymentRecord,
  SiteConfig,
  SiteInfo,
} from '../types/api';

const TOKEN_KEY = 'askmm_auth_token';

// Base URL resolution:
// 1. If VITE_API_URL is set (e.g. in .env), use it with /api suffix.
// 2. Otherwise default to '/api', which uses Vite's local dev server proxy (http://127.0.0.1:3000) or same-origin in production.
const rawBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
export const API_BASE_URL = rawBaseUrl ? `${rawBaseUrl}/api` : '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error messages cleanly
export function parseApiError(error: unknown, fallback = 'Request failed. Please try again.'): Error {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (error.response?.status === 429) {
      return new Error('Too many requests. Please wait a moment and try again.');
    }
    if (data) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return new Error(data.errors.join(' '));
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        return new Error(data.message.trim());
      }
      if (typeof data.error === 'string' && data.error.trim()) {
        return new Error(data.error.trim());
      }
    }
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timed out. Please check your network connection.');
    }
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return new Error('Cannot reach backend server. Please ensure the backend is running on port 3000 (npm run dev:backend).');
    }
    if (error.message) {
      return new Error(error.message);
    }
  }
  return new Error(error instanceof Error && error.message ? error.message : fallback);
}

// Token management helpers
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('token');
    }
  } catch {
    // ignore local storage errors in private browsing
  }
}

// Generic HTTP methods
export async function getApi<T>(path: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.get<T>(path, { ...config, params: { ...params, ...(config?.params as Record<string, unknown>) } });
    return response.data;
  } catch (error) {
    throw parseApiError(error, `Failed to fetch data from ${path}`);
  }
}

export async function postApi<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.post<T>(path, body, config);
    return response.data;
  } catch (error) {
    throw parseApiError(error, `The request to ${path} could not be submitted.`);
  }
}

export async function putApi<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.put<T>(path, body, config);
    return response.data;
  } catch (error) {
    throw parseApiError(error, `The update to ${path} failed.`);
  }
}

export async function patchApi<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.patch<T>(path, body, config);
    return response.data;
  } catch (error) {
    throw parseApiError(error, `The modification to ${path} failed.`);
  }
}

export async function deleteApi<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.delete<T>(path, config);
    return response.data;
  } catch (error) {
    throw parseApiError(error, `Failed to delete resource at ${path}`);
  }
}

export async function uploadApi<T>(
  path: string,
  formData: FormData,
  config?: AxiosRequestConfig,
  method: 'post' | 'put' = 'post'
): Promise<T> {
  try {
    const requestFn = method === 'put' ? apiClient.put : apiClient.post;
    const response = await requestFn<T>(path, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error, `File upload to ${path} failed.`);
  }
}

// High-level Domain Services
export const api = {
  // Public CMS & Site Configuration
  site: {
    getInfo: () => getApi<SiteInfo>('/site'),
    getConfig: () => getApi<SiteConfig>('/config'),
    getHealth: () => getApi<HealthResponse>('/health'),
  },

  // Team & Leadership
  team: {
    getAll: () => getApi<ApiTeamMember[]>('/team'),
  },

  // Events & Activities
  events: {
    getAll: (params?: { category?: string; limit?: number }) =>
      getApi<ApiEventItem[]>('/events', params),
  },

  // Gallery
  gallery: {
    getAll: (params?: { album?: string; limit?: number }) =>
      getApi<ApiGalleryItem[]>('/gallery', params),
  },

  // Contact & Volunteering Enquiries
  contact: {
    submit: (data: ContactSubmission) => postApi<ContactResponse>('/contact', data),
  },

  // Members & Directory
  members: {
    list: (params?: MemberQueryParams) => getApi<MemberListResponse>('/members', params),
    signup: (data: { name: string; email: string; mobile: string; password: string }) =>
      postApi<{ message: string }>('/member/signup', data),
    login: (data: { email: string; password: string }) =>
      postApi<{ token: string; member: { id: number; name: string; email: string; mobile: string } }>('/member/login', data),
    getCurrent: (token: string) =>
      getApi<{ member: { id: number; name: string; email: string; mobile: string } }>('/member/me', undefined, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    getNotifications: (token: string) =>
      getApi<{ notifications: MemberNotification[]; unread_count: number }>('/member/notifications', undefined, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    markNotificationRead: (token: string, id: number) =>
      patchApi<{ success: boolean }>(`/member/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    register: (data: FormData | Record<string, unknown>) => {
      if (data instanceof FormData) {
        return uploadApi<MemberRegistrationResponse>('/register', data);
      }
      return postApi<MemberRegistrationResponse>('/register', data);
    },
  },

  // Donations & Payments
  donations: {
    createOrder: (data: DonationOrderInput) => postApi<DonationOrderResponse>('/donate/order', data),
    verify: (data: DonationVerifyInput) => postApi<DonationVerifyResponse>('/donate/verify', data),
  },

  payments: {
    recordOffline: (data: { membership_id: string; amount: number; reference_id?: string; notes?: string }) =>
      postApi<{ success: boolean; message: string; payment: unknown }>('/payments/offline', data),
    createRazorpayOrder: (data: { membership_id: string; amount: number; notes?: string }) =>
      postApi<{ order_id: string; amount: number; currency: string; key: string; method: string; membership_id: string }>(
        '/payments/razorpay/order',
        data
      ),
    verifyRazorpay: (data: {
      membership_id: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => postApi<{ success: boolean; message: string; payment_id: string; order_id: string }>('/payments/razorpay/verify', data),
  },

  // Admin Portal API
  admin: {
    login: (credentials: AdminLoginInput) => postApi<AdminLoginResponse>('/admin/login', credentials),
    logout: () => postApi<{ message: string }>('/admin/logout'),
    getMe: () => getApi<{ id: number; username: string }>('/admin/me'),
    getStats: () => getApi<AdminStats>('/admin/stats'),
    getMembers: (params?: MemberQueryParams) => getApi<MemberListResponse>('/admin/members', params),
    getMember: (id: number | string) => getApi<FullMember>(`/admin/members/${id}`),
    createMember: (data: FormData | Record<string, unknown>) => {
      if (data instanceof FormData) {
        return uploadApi<FullMember>('/admin/members', data);
      }
      return postApi<FullMember>('/admin/members', data);
    },
    updateMember: (id: number | string, data: FormData | Record<string, unknown>) => {
      if (data instanceof FormData) {
        return uploadApi<FullMember>(`/admin/members/${id}`, data, undefined, 'put');
      }
      return putApi<FullMember>(`/admin/members/${id}`, data);
    },
    toggleActive: (id: number | string, is_active?: 0 | 1) =>
      patchApi<FullMember>(`/admin/members/${id}/active`, is_active !== undefined ? { is_active } : {}),
    updateStatus: (id: number | string, membership_status: string) =>
      patchApi<FullMember>(`/admin/members/${id}/status`, { membership_status }),
    updateCategory: (id: number | string, category: string) =>
      patchApi<FullMember>(`/admin/members/${id}/category`, { category }),
    updatePayment: (id: number | string, payment: Record<string, unknown>) =>
      patchApi<FullMember>(`/admin/members/${id}/payment`, payment),
    deleteMember: (id: number | string) =>
      deleteApi<{ success: boolean; message: string }>(`/admin/members/${id}`),
    getPayments: (params?: Record<string, unknown>) =>
      getApi<{ total: number; payments: PaymentRecord[] }>('/admin/payments', params),
    sendNotification: (data: { title: string; message: string; audience: 'all' | 'category' | 'selected'; category?: string; member_ids?: string[] }) =>
      postApi<{ success: boolean; recipient_count: number }>('/admin/notifications', data),
    getNotifications: () =>
      getApi<{ notifications: Array<{ id: number; title: string; message: string; audience: string; category: string | null; recipient_count: number; created_at: string }> }>('/admin/notifications'),
    updatePaymentRecord: (id: number, status: string) =>
      patchApi<{ success: boolean; payment: PaymentRecord }>(`/admin/payments/${id}`, { status }),
    getEnquiries: () => getApi<Enquiry[]>('/admin/cms/enquiries'),
    markEnquiryRead: (id: number, is_read: 0 | 1) =>
      patchApi<{ success: boolean }>(`/admin/cms/enquiries/${id}/read`, { is_read }),
    deleteEnquiry: (id: number) =>
      deleteApi<{ success: boolean }>(`/admin/cms/enquiries/${id}`),
    getGallery: () => getApi<ApiGalleryItem[]>('/admin/cms/gallery'),
    createGalleryItem: (data: FormData) => uploadApi<ApiGalleryItem>('/admin/cms/gallery', data),
    deleteGalleryItem: (id: number | string) => deleteApi<{ success: boolean }>(`/admin/cms/gallery/${id}`),
    getAuditLogs: (params?: Record<string, unknown>) =>
      getApi<{ total: number; page: number; limit: number; pages: number; logs: AuditLog[] }>('/admin/audit-logs', params),
    getExportCsvUrl: () => `${API_BASE_URL}/admin/members/export.csv`,
  },
};

export default api;
