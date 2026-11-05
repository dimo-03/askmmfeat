import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Lock,
  LogOut,
  Mail,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { FOUNDATION } from '@/data/site';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import api, { getAuthToken, setAuthToken } from '@/lib/api';
import type {
  AdminStats,
  ApiGalleryItem,
  AuditLog,
  Enquiry,
  FullMember,
  PaymentRecord,
  PublicMember,
} from '@/types/api';

type Tab = 'overview' | 'members' | 'payments' | 'notifications' | 'gallery' | 'enquiries' | 'audit';

export default function Admin() {
  useDocumentTitle('Admin Portal - Membership & Operations Management');

  // Auth State
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [adminUser, setAdminUser] = useState<string>('');
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Active Tab & UI state
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Overview Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Members Tab
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersPage, setMembersPage] = useState(1);
  const [membersLoading, setMembersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberMobile, setNewMemberMobile] = useState('');
  const [newMemberLocation, setNewMemberLocation] = useState('Bhubaneswar');
  const [newMemberDesignation, setNewMemberDesignation] = useState('Member');
  const [newMemberPaymentReference, setNewMemberPaymentReference] = useState('');
  const [newMemberPaymentAmount, setNewMemberPaymentAmount] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState<File | null>(null);
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  // Edit Member Modal
  const [editingMember, setEditingMember] = useState<FullMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editValidityStart, setEditValidityStart] = useState('');
  const [editValidityEnd, setEditValidityEnd] = useState('');
  const [editOrganization, setEditOrganization] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editDob, setEditDob] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editMembershipStatus, setEditMembershipStatus] = useState('Approved');
  const [editIsActive, setEditIsActive] = useState<number>(1);
  const [editPaymentReference, setEditPaymentReference] = useState('');
  const [editPaymentAmount, setEditPaymentAmount] = useState('');
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Payments Tab
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Notifications Tab
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationAudience, setNotificationAudience] = useState<'all' | 'category' | 'selected'>('all');
  const [notificationCategory, setNotificationCategory] = useState('');
  const [selectedNotificationMembers, setSelectedNotificationMembers] = useState<string[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<Array<{ id: number; title: string; message: string; audience: string; category: string | null; recipient_count: number; created_at: string }>>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Gallery Tab
  const [galleryItems, setGalleryItems] = useState<ApiGalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryAlbum, setGalleryAlbum] = useState('Community Programmes');
  const [galleryPhoto, setGalleryPhoto] = useState<File | null>(null);
  const [gallerySubmitting, setGallerySubmitting] = useState(false);

  // Enquiries Tab
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

  // Audit Logs Tab
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Auto-dismiss feedback message
  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  // Check existing token on mount
  useEffect(() => {
    if (token) {
      api.admin
        .getMe()
        .then((res) => {
          setAdminUser(res.username);
        })
        .catch(() => {
          setAuthToken(null);
          setToken(null);
        });
    } else {
      api.site
        .getHealth()
        .then(() => setBackendOnline(true))
        .catch(() => setBackendOnline(false));
    }
  }, [token]);

  // Load Tab Data
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await api.admin.getStats();
      setStats(data);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load stats' });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadMembers = useCallback(async (page = 1) => {
    setMembersLoading(true);
    try {
      const res = await api.admin.getMembers({
        page,
        limit: 12,
        q: searchQuery.trim() || undefined,
        membership_status: statusFilter || undefined,
      });
      setMembers(res.members);
      setMembersTotal(res.total);
      setMembersPage(res.page);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load members' });
    } finally {
      setMembersLoading(false);
    }
  }, [searchQuery, statusFilter]);

  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await api.admin.getPayments();
      setPayments(res.payments);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load payments' });
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotificationLoading(true);
    try {
      const [data, memberData] = await Promise.all([
        api.admin.getNotifications(),
        api.admin.getMembers({ page: 1, limit: 200 }),
      ]);
      setNotificationHistory(data.notifications);
      setMembers(memberData.members);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load notifications' });
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  const loadGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const data = await api.admin.getGallery();
      setGalleryItems(data);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load gallery' });
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  const loadEnquiries = useCallback(async () => {
    setEnquiriesLoading(true);
    try {
      const data = await api.admin.getEnquiries();
      setEnquiries(data);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load enquiries' });
    } finally {
      setEnquiriesLoading(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await api.admin.getAuditLogs({ limit: 40 });
      setAuditLogs(res.logs);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load audit logs' });
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    if (activeTab === 'overview') loadStats();
    if (activeTab === 'members') loadMembers();
    if (activeTab === 'payments') loadPayments();
    if (activeTab === 'notifications') loadNotifications();
    if (activeTab === 'gallery') loadGallery();
    if (activeTab === 'enquiries') loadEnquiries();
    if (activeTab === 'audit') loadAuditLogs();
  }, [token, activeTab, loadStats, loadMembers, loadPayments, loadNotifications, loadGallery, loadEnquiries, loadAuditLogs]);

  const handleSendNotification = async (e: FormEvent) => {
    e.preventDefault();
    setNotificationLoading(true);
    try {
      const result = await api.admin.sendNotification({
        title: notificationTitle,
        message: notificationMessage,
        audience: notificationAudience,
        category: notificationAudience === 'category' ? notificationCategory : undefined,
        member_ids: notificationAudience === 'selected' ? selectedNotificationMembers : undefined,
      });
      setActionMessage({ type: 'success', text: `Notification sent to ${result.recipient_count} member(s).` });
      setNotificationTitle('');
      setNotificationMessage('');
      setSelectedNotificationMembers([]);
      await loadNotifications();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to send notification' });
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.admin.login({ username: loginUsername.trim(), password: loginPassword });
      setAuthToken(res.token);
      setToken(res.token);
      setAdminUser(res.username);
      setActionMessage({ type: 'success', text: `Welcome back, ${res.username}!` });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Invalid username or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.admin.logout();
    } catch {
      // ignore
    } finally {
      setAuthToken(null);
      setToken(null);
      setAdminUser('');
      setActionMessage({ type: 'success', text: 'You have been logged out securely.' });
    }
  };

  // Member Actions
  const handleToggleActive = async (member: PublicMember) => {
    const next = member.is_active === 1 ? 0 : 1;
    try {
      await api.admin.toggleActive(member.id, next);
      setActionMessage({
        type: 'success',
        text: `Member ${member.name} is now ${next === 1 ? 'Active' : 'Inactive'}.`,
      });
      loadMembers(membersPage);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Status update failed' });
    }
  };

  const handleStatusChange = async (member: PublicMember, status: string) => {
    try {
      await api.admin.updateStatus(member.id, status);
      setActionMessage({ type: 'success', text: `${member.name} status updated to ${status}.` });
      loadMembers(membersPage);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Status update failed' });
    }
  };

  const handleDeleteMember = async (member: PublicMember) => {
    if (!window.confirm(`Are you sure you want to permanently delete member ${member.name} (${member.membership_id})?`)) {
      return;
    }
    try {
      await api.admin.deleteMember(member.id);
      setActionMessage({ type: 'success', text: `Member ${member.name} deleted successfully.` });
      loadMembers(membersPage);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete member' });
    }
  };

  const handleCreateMember = async (e: FormEvent) => {
    e.preventDefault();
    setAddMemberLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', newMemberName.trim());
      fd.append('email', newMemberEmail.trim());
      fd.append('mobile', newMemberMobile.trim());
      fd.append('location', newMemberLocation.trim());
      fd.append('designation', newMemberDesignation.trim());
      if (newMemberPaymentReference.trim()) {
        fd.append('payment_reference', newMemberPaymentReference.trim());
      }
      if (newMemberPaymentAmount.trim()) {
        fd.append('payment_amount', newMemberPaymentAmount.trim());
      }
      fd.append('payment_status', 'Paid');
      if (newMemberPhoto) {
        fd.append('photo', newMemberPhoto);
      }
      await api.admin.createMember(fd);
      setActionMessage({ type: 'success', text: `Member ${newMemberName} added successfully!` });
      setShowAddModal(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberMobile('');
      setNewMemberPaymentReference('');
      setNewMemberPaymentAmount('');
      setNewMemberPhoto(null);
      loadMembers(1);
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create member' });
    } finally {
      setAddMemberLoading(false);
    }
  };

  const openEditModal = async (member: PublicMember) => {
    try {
      const full = await api.admin.getMember(member.id);
      setEditingMember(full);
      setEditName(full.name || '');
      setEditEmail(full.email || '');
      setEditMobile(full.mobile || '');
      setEditLocation(full.location || '');
      setEditDesignation(full.designation || 'Member');
      setEditValidityStart(full.validity_start || '');
      setEditValidityEnd(full.validity_end || '');
      setEditOrganization(full.organization || '');
      setEditAddress(full.address || '');
      setEditGender(full.gender || 'Male');
      setEditDob(full.date_of_birth || '');
      setEditNotes(full.notes || '');
      setEditMembershipStatus(full.membership_status || 'Approved');
      setEditIsActive(full.is_active ?? 1);
      setEditPaymentReference(full.payment_reference || '');
      setEditPaymentAmount(full.payment_amount ? String(full.payment_amount) : '');
      setEditPhotoPreview(full.photo || null);
      setEditPhotoFile(null);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to fetch member details',
      });
    }
  };

  const handleUpdateMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', editName.trim());
      fd.append('email', editEmail.trim());
      fd.append('mobile', editMobile.trim());
      fd.append('location', editLocation.trim());
      fd.append('designation', editDesignation.trim());
      if (editValidityStart) fd.append('validity_start', editValidityStart);
      if (editValidityEnd) fd.append('validity_end', editValidityEnd);
      if (editOrganization) fd.append('organization', editOrganization.trim());
      if (editAddress) fd.append('address', editAddress.trim());
      if (editGender) fd.append('gender', editGender);
      if (editDob) fd.append('date_of_birth', editDob);
      if (editNotes) fd.append('notes', editNotes.trim());
      fd.append('membership_status', editMembershipStatus);
      fd.append('is_active', String(editIsActive));
      if (editPaymentReference.trim()) {
        fd.append('payment_reference', editPaymentReference.trim());
      } else {
        fd.append('payment_reference', '');
      }
      if (editPaymentAmount.trim()) {
        fd.append('payment_amount', editPaymentAmount.trim());
      }
      if (editPhotoFile) {
        fd.append('photo', editPhotoFile);
      }

      await api.admin.updateMember(editingMember.id, fd);
      setActionMessage({ type: 'success', text: `Member ${editName} updated successfully!` });
      setEditingMember(null);
      loadMembers(membersPage);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update member',
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateGalleryItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!galleryPhoto) {
      setActionMessage({ type: 'error', text: 'Please choose a photo before adding it to the gallery.' });
      return;
    }
    setGallerySubmitting(true);
    try {
      const fd = new FormData();
      fd.append('caption', galleryCaption.trim());
      fd.append('album', galleryAlbum.trim());
      fd.append('photo', galleryPhoto);
      await api.admin.createGalleryItem(fd);
      setActionMessage({ type: 'success', text: 'Photo added to the gallery successfully.' });
      setGalleryCaption('');
      setGalleryAlbum('Community Programmes');
      setGalleryPhoto(null);
      await loadGallery();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to add gallery photo' });
    } finally {
      setGallerySubmitting(false);
    }
  };

  const handleDeleteGalleryItem = async (id: number | string) => {
    if (!window.confirm('Delete this photo from the gallery?')) return;
    try {
      await api.admin.deleteGalleryItem(id);
      setActionMessage({ type: 'success', text: 'Photo removed from the gallery.' });
      setGalleryItems((prev) => prev.filter((photo) => photo.id !== Number(id)));
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete gallery photo' });
    }
  };

  const handleToggleEnquiryRead = async (enquiry: Enquiry) => {
    const next = enquiry.is_read === 1 ? 0 : 1;
    try {
      await api.admin.markEnquiryRead(enquiry.id, next);
      setEnquiries((prev) => prev.map((e) => (e.id === enquiry.id ? { ...e, is_read: next } : e)));
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update enquiry' });
    }
  };

  const handleDeleteEnquiry = async (id: number) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.admin.deleteEnquiry(id);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setActionMessage({ type: 'success', text: 'Message deleted.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete enquiry' });
    }
  };

  const handleUpdatePaymentStatus = async (paymentId: number, status: string) => {
    try {
      await api.admin.updatePaymentRecord(paymentId, status);
      setActionMessage({ type: 'success', text: `Payment #${paymentId} marked as ${status}.` });
      loadPayments();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update payment' });
    }
  };

  const exportPaymentsExcel = () => {
    const escapeCell = (value: string | number | null | undefined) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['ID', 'Member ID', 'Member Name', 'Method', 'Amount', 'Status', 'Reference', 'Date'],
      ...payments.map((payment) => [
        payment.id,
        payment.membership_id || '',
        payment.member_name || '',
        payment.method,
        payment.amount,
        payment.status,
        payment.reference_id || payment.razorpay_order_id || '',
        payment.created_at || '',
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff', csv], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-records-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Nav items configuration for sidebar
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: undefined },
    { id: 'members', label: 'Members', icon: Users, count: stats?.total },
    { id: 'payments', label: 'Payments', icon: CreditCard, count: stats?.payments?.paid_count },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: undefined },
    { id: 'gallery', label: 'Gallery', icon: Plus, count: galleryItems.length || undefined },
    {
      id: 'enquiries',
      label: 'Enquiries',
      icon: Mail,
      count: enquiries.filter((e) => e.is_read === 0).length || undefined,
      badgeColor: 'bg-gold-400 text-navy-900',
    },
  ];

  // ----------------------------------------------------
  // Unauthenticated: Show Admin Login Box
  // ----------------------------------------------------
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card ring-1 ring-navy-100 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 shadow-md">
              <Lock className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-2xl font-black text-navy-900">Admin Portal</h1>
            <p className="mt-2 text-sm text-muted">Sign in with your administrator credentials to manage members and operations.</p>
          </div>

          {loginError && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {backendOnline === false && !loginError && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">Backend Server Offline (Port 3001)</p>
                <p className="mt-1 text-amber-800">
                  Please ensure your backend is running. Start it with{' '}
                  <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">npm run dev</code> or{' '}
                  <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded">npm run dev:backend</code>.
                </p>
              </div>
            </div>
          )}

          {actionMessage && (
            <div
              className={`mt-6 flex items-center gap-3 rounded-2xl p-4 text-sm font-medium ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                  : 'bg-red-50 text-red-700 ring-1 ring-red-200'
              }`}
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>{actionMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="admin-username" className="block text-xs font-bold uppercase tracking-wider text-navy-900">
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-navy-900">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="admin-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 pr-12 text-sm text-navy-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-navy-500 transition hover:bg-navy-50 hover:text-navy-900 focus:outline-none"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? (
                    <EyeOff className="h-4 w-4 text-navy-700" />
                  ) : (
                    <Eye className="h-4 w-4 text-navy-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 py-3.5 text-sm font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-navy-800 disabled:opacity-50"
            >
              {loginLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-gold-400" />}
              {loginLoading ? 'Verifying...' : 'Sign In to Portal'}
            </button>
          </form>

          

          {backendOnline === true && (
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-emerald-700">
              {/* <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" /> */}
              {/* <span>Backend API Connected (Port 3001)</span> */}
            </div>
          )}

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs font-semibold text-navy-900 hover:text-gold-600 transition">
              ← Return to public website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Authenticated Portal Dashboard with Vertical Sidebar
  // ----------------------------------------------------
  return (
    <div className="flex min-h-screen bg-mist text-navy-900">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ========================================================= */}
      {/* VERTICAL SIDEBAR (MATCHING NAVY & GOLD BRAND THEME)        */}
      {/* ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-navy-800 bg-navy-900 text-white transition-all duration-300 ease-in-out lg:static ${
          sidebarOpen
            ? 'w-72 translate-x-0 opacity-100 shadow-2xl lg:shadow-none'
            : 'w-0 -translate-x-full overflow-hidden opacity-0 pointer-events-none lg:w-0'
        }`}
        style={{ backgroundColor: '#0B1F4D' }}
      >
        {/* Top Section: Gold Stripe + Logo Branding + Nav Menu (Positioned directly at top) */}
        <div className="flex w-72 flex-col">
          {/* Top Gold Gradient Accent */}
          <div className="h-1 w-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" aria-hidden="true" />

          {/* Top: Logo & Branding + Sidebar Close Button */}
          <div className="flex items-center justify-between border-b border-white/10 p-5 bg-navy-900">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 ring-2 ring-gold-400 shadow-md">
                <img
                  src={FOUNDATION.logo}
                  alt="ASKMM Foundation"
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <h1 className="text-base font-black tracking-tight text-white">ASKMM Portal</h1>
                <p className="text-[11px] font-medium text-gold-400">Admin Dashboard</p>
              </div>
            </div>

            {/* Sidebar Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl p-2 text-white/70 transition hover:bg-navy-800 hover:text-white"
              title="Close Sidebar"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links (Starts immediately under the logo bar) */}
          <nav className="flex flex-col gap-1.5 p-4" aria-label="Admin Navigation">
            <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-gold-400/70">
              Management Menu
            </p>

            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as Tab);
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-gold-400 text-navy-900 shadow-md'
                      : 'text-navy-100 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-4 w-4 transition-transform duration-200 ${
                        active ? 'text-navy-900 scale-110' : 'text-gold-400 group-hover:scale-110'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {typeof item.count === 'number' && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        active
                          ? 'bg-navy-900 text-gold-400'
                          : item.badgeColor || 'bg-navy-800 text-white'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Profile & Actions */}
        <div className="w-72 border-t border-white/10 p-4 space-y-3 bg-navy-900">
          {/* Public Website Shortcut */}
          <Link
            to="/"
            className="flex items-center justify-between rounded-xl border border-navy-800 bg-navy-800/80 px-3.5 py-2.5 text-xs font-semibold text-navy-100 transition hover:bg-navy-800 hover:text-gold-300"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-gold-400" />
              <span>Public Website</span>
            </span>
            <span className="text-[10px] text-gold-400/80 font-bold">Open</span>
          </Link>

          {/* Admin User Card */}
          <div className="flex items-center justify-between rounded-2xl border border-navy-800 bg-navy-800/60 p-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400/20 text-gold-300">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{adminUser || 'admin'}</p>
                <p className="text-[10px] font-semibold text-emerald-400">Authenticated</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl p-2 text-navy-300 transition hover:bg-red-500/20 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA                                         */}
      {/* ========================================================= */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Top Navbar Matching Brand Theme */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-800 bg-navy-900 px-4 py-3.5 text-white shadow-md sm:px-8">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button (Close/Open on Desktop & Mobile) */}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-800 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-navy-700 hover:text-gold-300"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              title={sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            >
              {sidebarOpen ? (
                <>
                  <PanelLeftClose className="h-4 w-4 text-gold-400" />
                  {/* <span className="hidden sm:inline">Close Menu</span> */}
                </>
              ) : (
                <>
                  <PanelLeftOpen className="h-4 w-4 text-gold-400" />
                  <span>Open Menu</span>
                </>
              )}
            </button>

            <div>
              {/* <p className="text-[11px] font-bold uppercase tracking-wider text-gold-400">
                Admin Portal / <span className="text-white capitalize">{activeTab}</span>
              </p> */}
              <h2 className="text-lg font-black text-white sm:text-xl capitalize">
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'members' && 'Member Directory'}
                {activeTab === 'payments' && 'Payment Records'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'gallery' && 'Gallery Manager'}
                {activeTab === 'enquiries' && 'Inquiries & Messages'}
              </h2>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {activeTab === 'members' && (
              <>
                <a
                  href={api.admin.getExportCsvUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden items-center gap-1.5 rounded-full border border-navy-700 bg-navy-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-navy-700 hover:text-gold-300 sm:flex"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </a>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-2 text-xs font-bold text-navy-900 shadow-sm transition hover:bg-gold-300"
                >
                  <Plus className="h-3.5 w-3.5 text-navy-900" />
                  <span>Add Member</span>
                </button>
              </>
            )}

            {activeTab === 'overview' && (
              <button
                onClick={loadStats}
                disabled={statsLoading}
                className="flex items-center gap-1.5 rounded-full border border-navy-700 bg-navy-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-navy-700 hover:text-gold-300"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}

            {activeTab === 'payments' && (
              <>
                <button
                  onClick={loadPayments}
                  disabled={paymentsLoading}
                  className="flex items-center gap-1.5 rounded-full border border-navy-700 bg-navy-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-navy-700 hover:text-gold-300"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${paymentsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </>
            )}

            {activeTab === 'enquiries' && (
              <button
                onClick={loadEnquiries}
                disabled={enquiriesLoading}
                className="flex items-center gap-1.5 rounded-full border border-navy-700 bg-navy-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-navy-700 hover:text-gold-300"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${enquiriesLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}

          </div>
        </header>

        {/* Feedback Alert Toast */}
        {actionMessage && (
          <div className="mx-4 mt-4 sm:mx-8">
            <div
              className={`flex items-center justify-between gap-3 rounded-2xl p-4 text-xs sm:text-sm font-medium shadow-card ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                  : 'bg-red-50 text-red-700 ring-1 ring-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {actionMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span>{actionMessage.text}</span>
              </div>
              <button onClick={() => setActionMessage(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Tab Body */}
        <main className="p-4 sm:p-8">
          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW & STATS                                   */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              {/* Quick KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Total Members</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
                      <Users className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4 text-3xl font-black text-navy-900">{stats?.total ?? 0}</div>
                  <div className="mt-2 text-xs text-muted">
                    <span className="font-semibold text-emerald-600">+{stats?.newThisMonth ?? 0}</span> new this month
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Active & Approved</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <UserCheck className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4 text-3xl font-black text-emerald-600">{stats?.active ?? 0}</div>
                  <div className="mt-2 text-xs text-muted">Verified & published members</div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Pending Approvals</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Clock className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4 text-3xl font-black text-amber-600">{stats?.pending ?? 0}</div>
                  <div className="mt-2 text-xs text-muted">Awaiting fee verification</div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Total Revenue (Paid)</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
                      <CreditCard className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4 text-3xl font-black text-navy-900">
                    ₹{(stats?.payments?.total_paid_amount ?? 0).toLocaleString('en-IN')}
                  </div>
                  <div className="mt-2 text-xs text-muted">
                    <span className="font-semibold">{stats?.payments?.paid_count ?? 0}</span> paid transactions
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MEMBERS MANAGEMENT                                 */}
          {/* ========================================================= */}
          {activeTab === 'members' && (
            <div className="flex flex-col gap-6">
              {/* Search and Filters */}
              <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-card ring-1 ring-navy-100 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadMembers(1)}
                    placeholder="Search by name, ID, mobile, email..."
                    className="w-full rounded-2xl border border-navy-200 bg-mist py-2.5 pl-10 pr-4 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setTimeout(() => loadMembers(1), 0);
                  }}
                  className="rounded-2xl border border-navy-200 bg-mist px-3 py-2.5 text-xs text-navy-900 outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>

                <button
                  onClick={() => loadMembers(1)}
                  className="rounded-2xl bg-navy-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800"
                >
                  Apply
                </button>
              </div>

              {/* Members Table */}
              <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-navy-100 bg-navy-50/50 text-[11px] font-bold uppercase tracking-wider text-navy-900">
                      <tr>
                        <th className="py-4 pl-6 pr-3">Member</th>
                        <th className="px-3 py-4">ID</th>
                        <th className="px-3 py-4">Location</th>
                        <th className="px-3 py-4">Status</th>
                        <th className="px-3 py-4">Active</th>
                        <th className="py-4 pl-3 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-50">
                      {membersLoading ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-muted">
                            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-navy-900" />
                            <p className="mt-2">Loading members...</p>
                          </td>
                        </tr>
                      ) : members.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-muted">
                            No members match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        members.map((m) => (
                          <tr key={m.id} className="transition hover:bg-mist/50">
                            {/* Member Photo + Name */}
                            <td className="py-4 pl-6 pr-3">
                              <div className="flex items-center gap-3">
                                {m.photo ? (
                                  <img
                                    src={m.photo}
                                    alt={m.name}
                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-400"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-100 text-navy-900">
                                    <User className="h-5 w-5" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-navy-900">{m.name}</div>
                                  <div className="text-[11px] text-muted">{m.designation || 'Member'}</div>
                                </div>
                              </div>
                            </td>

                            {/* Membership ID */}
                            <td className="px-3 py-4 font-mono font-semibold text-navy-900">{m.membership_id}</td>

                            {/* Location */}
                            <td className="px-3 py-4 text-muted">{m.location || '—'}</td>

                            {/* Status */}
                            <td className="px-3 py-4">
                              <select
                                value={m.membership_status}
                                onChange={(e) => handleStatusChange(m, e.target.value)}
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold outline-none ${
                                  m.membership_status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : m.membership_status === 'Pending'
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-red-50 text-red-800'
                                }`}
                              >
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Expired">Expired</option>
                              </select>
                              {m.membership_status === 'Pending' && (
                                <span className="mt-1.5 flex w-fit items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-800">
                                  <Clock className="h-3 w-3" />
                                  Verification required
                                </span>
                              )}
                            </td>

                            {/* Active Toggle */}
                            <td className="px-3 py-4">
                              <button
                                onClick={() => handleToggleActive(m)}
                                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                  m.is_active === 1
                                    ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                              >
                                {m.is_active === 1 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                <span>{m.is_active === 1 ? 'Active' : 'Inactive'}</span>
                              </button>
                            </td>

                            {/* Actions: Edit & Delete */}
                            <td className="py-4 pl-3 pr-6 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditModal(m)}
                                  className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white p-2 text-navy-700 transition hover:bg-gold-50 hover:text-gold-700"
                                  title="View Member Details"
                                  aria-label="View member details"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(m)}
                                  className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
                                  title="Delete Member"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {membersTotal > 12 && (
                  <div className="flex items-center justify-between border-t border-navy-100 px-6 py-4 text-xs text-muted">
                    <span>
                      Page {membersPage} of {Math.ceil(membersTotal / 12)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={membersPage <= 1}
                        onClick={() => loadMembers(membersPage - 1)}
                        className="rounded-xl border border-navy-200 px-3 py-1 font-semibold disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        disabled={membersPage >= Math.ceil(membersTotal / 12)}
                        onClick={() => loadMembers(membersPage + 1)}
                        className="rounded-xl border border-navy-200 px-3 py-1 font-semibold disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PAYMENTS                                           */}
          {/* ========================================================= */}
          {activeTab === 'payments' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-end rounded-2xl bg-white p-4 shadow-card ring-1 ring-navy-100">
                <button
                  onClick={exportPaymentsExcel}
                  className="ml-auto flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Excel</span>
                </button>
              </div>
              <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-100">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-navy-100 bg-navy-50/50 text-[11px] font-bold uppercase tracking-wider text-navy-900">
                    <tr>
                      <th className="py-4 pl-6 pr-3">ID</th>
                      <th className="px-3 py-4">Member ID</th>
                      <th className="px-3 py-4">Name</th>
                      <th className="px-3 py-4">Method</th>
                      <th className="px-3 py-4">Amount</th>
                      <th className="px-3 py-4">Status</th>
                      <th className="px-3 py-4">Reference</th>
                      <th className="px-3 py-4">Date</th>
                      <th className="py-4 pl-3 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50">
                    {paymentsLoading ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-muted">Loading payments...</td>
                      </tr>
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-muted">No payment records found.</td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id} className="transition hover:bg-mist/50">
                          <td className="py-4 pl-6 pr-3 font-mono font-semibold">#{p.id}</td>
                          <td className="px-3 py-4 font-mono font-bold text-navy-900">{p.membership_id || '—'}</td>
                          <td className="px-3 py-4 font-semibold text-navy-900">{p.member_name || '—'}</td>
                          <td className="px-3 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                                p.method === 'online' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {p.method}
                            </span>
                          </td>
                          <td className="px-3 py-4 font-bold text-navy-900">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                p.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'Failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-3 py-4 font-mono text-[11px] text-muted">{p.reference_id || p.razorpay_order_id || '—'}</td>
                          <td className="px-3 py-4 text-muted">{p.created_at || '—'}</td>
                          <td className="py-4 pl-3 pr-6 text-right">
                            {p.status !== 'Paid' ? (
                              <button
                                onClick={() => handleUpdatePaymentStatus(p.id, 'Paid')}
                                className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-700"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-semibold">Verified</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
              <form onSubmit={handleSendNotification} className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-navy-100 sm:p-6">
                <h3 className="text-lg font-black text-navy-900">Send Notification</h3>
                <div className="mt-5 grid gap-4">
                  <label className="grid gap-2 text-xs font-bold text-navy-800">
                    Title
                    <input value={notificationTitle} onChange={(event) => setNotificationTitle(event.target.value)} required maxLength={120}
                      className="rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-gold-500" />
                  </label>
                  <label className="grid gap-2 text-xs font-bold text-navy-800">
                    Message
                    <textarea value={notificationMessage} onChange={(event) => setNotificationMessage(event.target.value)} required rows={4} maxLength={1000}
                      className="resize-none rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-gold-500" />
                  </label>
                  <label className="grid gap-2 text-xs font-bold text-navy-800">
                    Send to
                    <select value={notificationAudience} onChange={(event) => setNotificationAudience(event.target.value as 'all' | 'category' | 'selected')}
                      className="rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-gold-500">
                      <option value="all">All members</option>
                      <option value="category">Member category</option>
                      <option value="selected">Selected members</option>
                    </select>
                  </label>
                  {notificationAudience === 'category' && (
                    <label className="grid gap-2 text-xs font-bold text-navy-800">
                      Category
                      <select value={notificationCategory} onChange={(event) => setNotificationCategory(event.target.value)}
                        className="rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-gold-500">
                        <option value="">Choose category</option>
                        {(members.length ? Array.from(new Set(members.map((member) => member.category))) : ['Life', 'Patron', 'Associate']).map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {notificationAudience === 'selected' && (
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-navy-200 p-2">
                      {members.map((member) => (
                        <label key={member.membership_id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-navy-50">
                          <input type="checkbox" checked={selectedNotificationMembers.includes(member.membership_id)}
                            onChange={(event) => setSelectedNotificationMembers((ids) => event.target.checked ? [...ids, member.membership_id] : ids.filter((id) => id !== member.membership_id))}
                          />
                          <span className="font-semibold">{member.name}</span>
                          <span className="ml-auto font-mono text-xs text-muted">{member.membership_id}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <button disabled={notificationLoading} className="mt-1 inline-flex items-center justify-center rounded-xl bg-gold-400 px-5 py-3 text-sm font-black text-navy-900 hover:bg-gold-300 disabled:opacity-60">
                    {notificationLoading ? 'Sending...' : 'Send Notification'}
                  </button>
                </div>
              </form>

              <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-navy-100 sm:p-6">
                <h3 className="text-lg font-black text-navy-900">Recent Notifications</h3>
                <div className="mt-4 space-y-3">
                  {notificationLoading && <p className="py-8 text-center text-xs text-muted">Loading...</p>}
                  {!notificationLoading && notificationHistory.length === 0 && <p className="py-8 text-center text-xs text-muted">No notifications sent yet.</p>}
                  {notificationHistory.map((notification) => (
                    <div key={notification.id} className="rounded-2xl border border-navy-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-navy-900">{notification.title}</p>
                        <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-1 text-[10px] font-bold text-navy-700">{notification.recipient_count} sent</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted">{notification.message}</p>
                      <p className="mt-3 text-[10px] text-navy-400">{notification.created_at}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: PUBLIC GALLERY MANAGEMENT                           */}
          {/* ========================================================= */}
          {activeTab === 'gallery' && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
              <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-navy-100 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-navy-900">Gallery Manager</h3>
                    <p className="mt-1 text-xs text-muted">Upload new public photos for the frontend gallery.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadGallery()}
                    className="rounded-full border border-navy-200 bg-mist px-3 py-1.5 text-[11px] font-bold text-navy-900 transition hover:border-gold-500 hover:bg-white"
                  >
                    Refresh
                  </button>
                </div>

                <form onSubmit={handleCreateGalleryItem} className="mt-5 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-xs font-bold text-navy-800">
                      Caption
                      <input
                        value={galleryCaption}
                        onChange={(e) => setGalleryCaption(e.target.value)}
                        placeholder="e.g. Classroom learning session"
                        className="rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-gold-500"
                      />
                    </label>
                    <label className="grid gap-2 text-xs font-bold text-navy-800">
                      Album
                      <select
                        value={galleryAlbum}
                        onChange={(e) => setGalleryAlbum(e.target.value)}
                        className="rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-gold-500"
                      >
                        <option value="Educational Programmes">Educational Programmes</option>
                        <option value="Social Activities">Social Activities</option>
                        <option value="Welfare Programmes">Welfare Programmes</option>
                        <option value="Workshops and Training">Workshops and Training</option>
                        <option value="Community Programmes">Community Programmes</option>
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-2 text-xs font-bold text-navy-800">
                    Photo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => setGalleryPhoto(e.target.files?.[0] || null)}
                      className="mt-1 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-navy-800"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={gallerySubmitting || !galleryPhoto}
                    className="flex items-center justify-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-xs font-bold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {gallerySubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 text-gold-400" />}
                    {gallerySubmitting ? 'Uploading...' : 'Add to Frontend Gallery'}
                  </button>
                </form>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-navy-100 sm:p-6">
                <h3 className="text-lg font-black text-navy-900">Current Gallery</h3>
                {galleryLoading ? (
                  <div className="mt-5 flex min-h-[180px] items-center justify-center text-sm text-muted">Loading photos...</div>
                ) : galleryItems.length === 0 ? (
                  <div className="mt-5 flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-navy-200 bg-mist text-sm text-muted">
                    No gallery photos yet.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="overflow-hidden rounded-2xl border border-navy-100 bg-mist">
                        <img src={item.photo} alt={item.caption || 'Gallery photo'} className="h-28 w-full object-cover" />
                        <div className="space-y-2 p-3">
                          <p className="text-xs font-bold text-navy-900">{item.caption || 'Untitled photo'}</p>
                          <p className="text-[11px] text-muted">{item.album || 'Uncategorized'}</p>
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: ENQUIRIES & CONTACT                                */}
          {/* ========================================================= */}
          {activeTab === 'enquiries' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {enquiriesLoading ? (
                  <div className="rounded-3xl bg-white p-12 text-center text-muted shadow-card">Loading messages...</div>
                ) : enquiries.length === 0 ? (
                  <div className="rounded-3xl bg-white p-12 text-center text-muted shadow-card">No inquiries received yet.</div>
                ) : (
                  enquiries.map((e) => (
                    <div
                      key={e.id}
                      className={`flex flex-col justify-between gap-4 rounded-3xl bg-white p-6 shadow-card ring-1 transition sm:flex-row sm:items-center ${
                        e.is_read === 0 ? 'ring-2 ring-gold-400 bg-gold-50/10' : 'ring-navy-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-navy-900">{e.name}</span>
                          {e.is_read === 0 && (
                            <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold text-navy-900">
                              NEW
                            </span>
                          )}
                          <span className="text-xs text-muted">{e.created_at}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted">
                          <span>
                            Email: <strong className="text-navy-900">{e.email}</strong>
                          </span>
                          {e.phone && (
                            <span>
                              Phone: <strong className="text-navy-900">{e.phone}</strong>
                            </span>
                          )}
                        </div>
                        <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-mist p-4 text-xs leading-relaxed text-navy-900">
                          {e.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleToggleEnquiryRead(e)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                            e.is_read === 0 ? 'bg-navy-900 text-white hover:bg-navy-800' : 'bg-mist text-navy-900 hover:bg-navy-100'
                          }`}
                        >
                          {e.is_read === 0 ? 'Mark Read' : 'Mark Unread'}
                        </button>
                        <button
                          onClick={() => handleDeleteEnquiry(e.id)}
                          className="rounded-full p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete Message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: AUDIT LOGS                                         */}
          {/* ========================================================= */}
          {activeTab === 'audit' && (
            <div className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-100">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-navy-100 bg-navy-50/50 text-[11px] font-bold uppercase tracking-wider text-navy-900">
                    <tr>
                      <th className="py-4 pl-6 pr-3">Timestamp</th>
                      <th className="px-3 py-4">Action</th>
                      <th className="px-3 py-4">Admin</th>
                      <th className="px-3 py-4">IP Address</th>
                      <th className="py-4 pl-3 pr-6">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-50 font-mono text-[11px]">
                    {auditLoading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted">Loading audit logs...</td>
                      </tr>
                    ) : auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted">No audit logs recorded yet.</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="transition hover:bg-mist/50">
                          <td className="py-3 pl-6 pr-3 text-muted">{log.created_at}</td>
                          <td className="px-3 py-3 font-bold text-navy-900">{log.action}</td>
                          <td className="px-3 py-3 text-gold-700">{log.admin_user || 'system'}</td>
                          <td className="px-3 py-3 text-muted">{log.ip_address || '—'}</td>
                          <td className="py-3 pl-3 pr-6 text-muted truncate max-w-xs">{log.details || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD MEMBER                                         */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-navy-100 sm:p-8">
            <div className="flex items-center justify-between border-b border-navy-100 pb-4">
              <h3 className="text-xl font-black text-navy-900">Add New Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 text-muted hover:bg-navy-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="mt-6 flex flex-col gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-navy-900">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Jena"
                  className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="email@example.org"
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newMemberMobile}
                    onChange={(e) => setNewMemberMobile(e.target.value)}
                    placeholder="+91 94370 00000"
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-navy-900">Location</label>
                <input
                  type="text"
                  value={newMemberLocation}
                  onChange={(e) => setNewMemberLocation(e.target.value)}
                  placeholder="e.g. Bhubaneswar, Odisha"
                  className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-navy-900">Designation / Role</label>
                <input
                  type="text"
                  value={newMemberDesignation}
                  onChange={(e) => setNewMemberDesignation(e.target.value)}
                  placeholder="e.g. Senior Advocate / Member"
                  className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>


              <div>
                <label className="block font-bold uppercase tracking-wider text-navy-900">Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setNewMemberPhoto(e.target.files?.[0] || null)}
                  className="mt-1 w-full text-xs text-muted file:mr-4 file:rounded-full file:border-0 file:bg-navy-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-navy-900 hover:file:bg-navy-200"
                />
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-navy-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full px-5 py-2.5 font-bold text-navy-900 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMemberLoading}
                  className="flex items-center gap-2 rounded-full bg-navy-900 px-6 py-2.5 font-bold text-white shadow-md hover:bg-navy-800 disabled:opacity-50"
                >
                  {addMemberLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 text-gold-400" />}
                  {addMemberLoading ? 'Saving...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT MEMBER DETAILS & PHOTO                        */}
      {/* ========================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="my-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-navy-100 sm:p-8">
            <div className="flex items-center justify-between border-b border-navy-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-gold-600">
                  {editingMember.membership_id}
                </span>
                <h3 className="text-xl font-black text-navy-900">Edit Member Details</h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="rounded-full p-1.5 text-muted hover:bg-navy-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="mt-6 flex flex-col gap-4 text-xs">
              {/* Photo Preview & Change */}
              <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-mist p-4 border border-navy-200">
                <div className="relative">
                  {editPhotoPreview ? (
                    <img
                      src={editPhotoPreview}
                      alt={editName}
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-gold-400 shadow-md"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-400">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <label className="block font-bold uppercase tracking-wider text-navy-900">
                    Change Member Photo
                  </label>
                  <p className="mt-0.5 text-[11px] text-muted">
                    Choose a new image to replace the current photo.
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setEditPhotoFile(file);
                      if (file) {
                        setEditPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="mt-2 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-navy-800"
                  />
                </div>
              </div>

              {/* Name & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Designation / Role</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-navy-900">Location / Area</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              {/* Validity Start & Validity End */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Validity Start (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={editValidityStart}
                    onChange={(e) => setEditValidityStart(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Validity End (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={editValidityEnd}
                    onChange={(e) => setEditValidityEnd(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Organization & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Organization / Bar</label>
                  <input
                    type="text"
                    value={editOrganization}
                    onChange={(e) => setEditOrganization(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Postal Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Status & Active Flag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Membership Status</label>
                  <select
                    value={editMembershipStatus}
                    onChange={(e) => setEditMembershipStatus(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist px-3 py-2.5 text-navy-900 outline-none focus:border-gold-500 focus:bg-white font-bold"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-navy-900">Active Directory Status</label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="edit_is_active"
                        checked={editIsActive === 1}
                        onChange={() => setEditIsActive(1)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-emerald-700">Active (Visible)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="edit_is_active"
                        checked={editIsActive === 0}
                        onChange={() => setEditIsActive(0)}
                        className="h-4 w-4 text-zinc-600 focus:ring-zinc-500"
                      />
                      <span className="font-bold text-zinc-600">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {(editingMember.pan_card || editingMember.aadhaar_card) && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                  <div className="mb-3 flex items-center gap-2 font-bold text-navy-900">
                    <FileText className="h-4 w-4 text-amber-600" />
                    Uploaded Verification Documents
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {editingMember.pan_card && (
                      <a href={editingMember.pan_card} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-navy-200 bg-white px-3 py-2 text-xs font-bold text-navy-900 hover:border-gold-500">
                        PAN Card
                        <ExternalLink className="h-4 w-4 text-gold-600" />
                      </a>
                    )}
                    {editingMember.aadhaar_card && (
                      <a href={editingMember.aadhaar_card} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-navy-200 bg-white px-3 py-2 text-xs font-bold text-navy-900 hover:border-gold-500">
                        Aadhaar Card
                        <ExternalLink className="h-4 w-4 text-gold-600" />
                      </a>
                    )}
                  </div>
                  {(editingMember.pan_number || editingMember.aadhaar_number) && (
                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      {editingMember.pan_number && <p><span className="text-muted">PAN:</span> <strong>{editingMember.pan_number}</strong></p>}
                      {editingMember.aadhaar_number && <p><span className="text-muted">Aadhaar:</span> <strong>{editingMember.aadhaar_number}</strong></p>}
                    </div>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-navy-900">Internal Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-navy-200 bg-mist p-3 text-navy-900 outline-none focus:border-gold-500 focus:bg-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="mt-4 flex justify-end gap-3 border-t border-navy-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="rounded-full px-5 py-2.5 font-bold text-navy-900 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center gap-2 rounded-full bg-navy-900 px-6 py-2.5 font-bold text-white shadow-md hover:bg-navy-800 disabled:opacity-50"
                >
                  {editLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-gold-400" />}
                  {editLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
