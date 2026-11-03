import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Filter,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import api from '@/lib/api';
import type { PublicMember } from '@/types/api';

export default function Membership() {
  useDocumentTitle('Membership Portal - Advocate Susil Kumar Mohapatra Memorial Foundation');

  // Active View Tab: 'directory' | 'register'
  const [activeTab, setActiveTab] = useState<'directory' | 'register'>('directory');

  // Directory State
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PublicMember | null>(null);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCategory, setRegCategory] = useState('Life');
  const [regOrganization, setRegOrganization] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regDob, setRegDob] = useState('');
  const [regNotes, setRegNotes] = useState('');
  const [regPaymentMethod, setRegPaymentMethod] = useState<'cash' | 'online'>('online');
  const [regPaymentReference, setRegPaymentReference] = useState('');
  const [regPaymentAmount, setRegPaymentAmount] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [regPanNumber, setRegPanNumber] = useState('');
  const [regAadhaarNumber, setRegAadhaarNumber] = useState('');
  const [regPanCard, setRegPanCard] = useState<File | null>(null);
  const [regAadhaarCard, setRegAadhaarCard] = useState<File | null>(null);
  const [regPassword, setRegPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<{
    membershipId: string;
    name: string;
    category: string;
    message: string;
  } | null>(null);

  // Fetch Directory Members
  const loadDirectory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.members.list({
        page,
        limit: 12,
        q: searchQuery.trim() || undefined,
        active: activeOnly ? 1 : undefined,
      });
      setMembers(res.members || []);
      setTotalMembers(res.total || 0);
      setTotalPages(res.pages || 1);
      setCurrentPage(res.page || 1);
    } catch (err) {
      console.error('Failed to load member directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory(1);
  }, [activeOnly]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    loadDirectory(1);
  };

  // Photo change handler
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setRegError('Photo file size must be less than 5MB.');
        return;
      }
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  // Registration Submit Handler
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const panNumber = regPanNumber.trim().toUpperCase();
    const aadhaarNumber = regAadhaarNumber.replace(/\s/g, '');
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      setRegError('Enter a valid PAN number in the format ABCDE1234F.');
      return;
    }
    if (!/^[2-9][0-9]{11}$/.test(aadhaarNumber)) {
      setRegError('Enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(regPassword)) {
      setRegError('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.');
      return;
    }
    if (!regPanCard) {
      setRegError('PAN card upload is required.');
      return;
    }
    if (!regAadhaarCard) {
      setRegError('Aadhaar card upload is required.');
      return;
    }
    setSubmitting(true);
    setRegError(null);

    try {
      const formData = new FormData();
      formData.append('name', regName.trim());
      formData.append('designation', regDesignation.trim());
      formData.append('location', regLocation.trim());
      formData.append('mobile', regMobile.trim());
      formData.append('email', regEmail.trim());
      formData.append('category', regCategory);
      if (regOrganization.trim()) formData.append('organization', regOrganization.trim());
      if (regAddress.trim()) formData.append('address', regAddress.trim());
      if (regGender) formData.append('gender', regGender);
      if (regDob) formData.append('date_of_birth', regDob);
      if (regNotes.trim()) formData.append('notes', regNotes.trim());
      formData.append('payment_method', regPaymentMethod);
      formData.append('pan_number', panNumber);
      formData.append('aadhaar_number', aadhaarNumber);
      formData.append('password', regPassword);
      if (regPaymentMethod === 'online' && regPaymentReference.trim()) {
        formData.append('payment_reference', regPaymentReference.trim());
      }
      if (regPaymentAmount.trim()) {
        formData.append('payment_amount', regPaymentAmount.trim());
      }
      if (photoFile) formData.append('photo', photoFile);
      formData.append('pan_card', regPanCard);
      formData.append('aadhaar_card', regAadhaarCard);

      const res = await api.members.register(formData);

      setRegisteredSuccess({
        membershipId: res.membership_id,
        name: regName.trim(),
        category: regCategory,
        message: res.message,
      });

      // Reset form
      setRegName('');
      setRegDesignation('');
      setRegLocation('');
      setRegMobile('');
      setRegEmail('');
      setRegCategory('Life');
      setRegOrganization('');
      setRegAddress('');
      setRegNotes('');
      setRegPaymentMethod('online');
      setRegPaymentReference('');
      setRegPaymentAmount('');
      setRegDob('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setRegPanNumber('');
      setRegAadhaarNumber('');
      setRegPanCard(null);
      setRegAadhaarCard(null);
      setRegPassword('');
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Membership Portal"
        description="Join an esteemed community of legal scholars, advocates, reformers, and community leaders dedicated to education, justice, empowerment, and public service."
        image="/second.png"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Membership' }]}
      />

      {/* Navigation Switch Bar */}
      <section className="sticky top-20 z-20 border-b border-navy-100 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2 rounded-2xl bg-mist p-1.5 ring-1 ring-navy-100">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === 'directory'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'text-navy-900 hover:text-navy-700'
              }`}
            >
              <Users className="h-4 w-4 text-gold-400" />
              <span>Member Directory</span>
              <span className="ml-1 rounded-full bg-navy-800 px-2 py-0.5 text-[10px] font-black text-gold-300">
                {totalMembers}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setRegisteredSuccess(null);
              }}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'text-navy-900 hover:text-navy-700'
              }`}
            >
              <UserPlus className="h-4 w-4 text-gold-400" />
              <span>Member Registration</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            <span>Open for Memberships </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="min-h-[600px] bg-mist/60 py-12 sm:py-16">
        <div className="container-x">
          {/* ============================================================= */}
          {/* TAB 1: MEMBER DIRECTORY                                       */}
          {/* ============================================================= */}
          {activeTab === 'directory' && (
            <div className="space-y-8">
              {/* Directory Filter & Search Header */}
              <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Search Bar */}
                  <form onSubmit={handleSearchSubmit} className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      
                      className="w-full rounded-2xl border border-navy-200 bg-mist py-3 pl-11 pr-24 text-xs text-navy-900 placeholder:text-muted/70 outline-none transition focus:border-gold-500 focus:bg-white focus:ring-2 focus:ring-gold-200"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-navy-900 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-navy-800"
                    >
                      Search
                    </button>
                  </form>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-navy-200 bg-mist px-4 py-2.5 text-xs font-bold text-navy-900 transition hover:bg-navy-100">
                      <input
                        type="checkbox"
                        checked={activeOnly}
                        onChange={(e) => setActiveOnly(e.target.checked)}
                        className="h-4 w-4 rounded text-gold-500 focus:ring-gold-400"
                      />
                      <span>Active Only</span>
                    </label>

                    <button
                      onClick={() => loadDirectory(currentPage)}
                      disabled={loading}
                      className="flex items-center gap-1.5 rounded-2xl border border-navy-200 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 shadow-xs transition hover:border-gold-400"
                      title="Refresh Directory"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 text-navy-900 ${loading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Members Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 text-center shadow-card ring-1 ring-navy-100">
                  <RefreshCw className="h-8 w-8 animate-spin text-gold-500" />
                  <p className="mt-4 text-sm font-bold text-navy-900">Loading Directory...</p>
                  <p className="text-xs text-muted">Fetching verified members from foundation records</p>
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-card ring-1 ring-navy-100">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mist text-navy-400">
                    <Users className="h-8 w-8" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-navy-900">No Members Found</h3>
                  <p className="mt-2 max-w-sm text-xs text-muted">
                    We couldn't find any registered members matching your search query or filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveOnly(false);
                      loadDirectory(1);
                    }}
                    className="mt-5 rounded-full bg-navy-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {members.map((member) => {
                    const isActive = member.is_active === 1;
                    return (
                      <div
                        key={member.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                      >
                        <div>
                          {/* Top Card: Photo & Status Badges */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="relative">
                              {member.photo ? (
                                <img
                                  src={member.photo}
                                  alt={member.name}
                                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-gold-400 shadow-md"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 ring-2 ring-gold-400/30 shadow-md">
                                  <User className="h-8 w-8" />
                                </div>
                              )}
                              {/* Status dot */}
                              <span
                                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                                  isActive ? 'bg-emerald-500' : 'bg-zinc-400'
                                }`}
                                title={isActive ? 'Status: Active Member' : 'Status: Inactive'}
                              />
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              {/* Category Badge */}
                              <span className="rounded-full bg-navy-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-navy-900 ring-1 ring-navy-200">
                                {member.category}
                              </span>

                              {/* Membership Status Badge */}
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  member.membership_status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-800'
                                    : member.membership_status === 'Pending'
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-zinc-100 text-zinc-700'
                                }`}
                              >
                                {member.membership_status}
                              </span>
                            </div>
                          </div>

                          {/* Member Info */}
                          <div className="mt-5">
                            <h3 className="text-base font-black text-navy-900 group-hover:text-navy-700">
                              {member.name}
                            </h3>
                            <p className="mt-0.5 text-xs font-semibold text-gold-700">
                              {member.designation || 'Member'}
                            </p>

                            {member.organization && (
                              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                                <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-navy-400" />
                                <span className="truncate">{member.organization}</span>
                              </p>
                            )}

                            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-navy-400" />
                              <span className="truncate">{member.location || 'Odisha, India'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Card Footer: Membership ID & Details Button */}
                        <div className="mt-6 border-t border-navy-50 pt-4">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-navy-900">
                              {member.membership_id}
                            </span>
                            <span
                              className={`flex items-center gap-1 font-bold ${
                                isActive ? 'text-emerald-700' : 'text-zinc-500'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-500' : 'bg-zinc-400'
                                }`}
                              />
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <button
                            onClick={() => setSelectedMember(member)}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-mist py-2 text-xs font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white"
                          >
                            <span>View Profile Details</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-3xl bg-white px-6 py-4 shadow-card ring-1 ring-navy-100 text-xs font-semibold text-muted">
                  <span>
                    Showing Page <strong className="text-navy-900">{currentPage}</strong> of{' '}
                    <strong className="text-navy-900">{totalPages}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadDirectory(currentPage - 1)}
                      disabled={currentPage <= 1 || loading}
                      className="flex items-center gap-1 rounded-xl border border-navy-200 px-3.5 py-1.5 font-bold text-navy-900 transition hover:border-gold-400 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={() => loadDirectory(currentPage + 1)}
                      disabled={currentPage >= totalPages || loading}
                      className="flex items-center gap-1 rounded-xl border border-navy-200 px-3.5 py-1.5 font-bold text-navy-900 transition hover:border-gold-400 disabled:opacity-40"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 2: MEMBER REGISTRATION FORM                               */}
          {/* ============================================================= */}
          {activeTab === 'register' && (
            <div className="mx-auto max-w-3xl">
              {/* Success Card */}
              {registeredSuccess ? (
                <div className="overflow-hidden rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-navy-100 sm:p-12">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>

                  <h2 className="mt-6 text-2xl font-black text-navy-900 sm:text-3xl">
                    Registration Successfully Submitted!
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    Welcome to Advocate Susil Kumar Mohapatra Memorial Foundation.
                  </p>

                  <div className="my-8 rounded-3xl bg-mist p-6 text-left ring-1 ring-navy-100">
                    <div className="grid gap-4 sm:grid-cols-2 text-xs">
                      <div>
                        <span className="font-semibold text-muted">Assigned Membership ID:</span>
                        <p className="mt-1 font-mono text-base font-black text-navy-900">
                          {registeredSuccess.membershipId}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-muted">Applicant Name:</span>
                        <p className="mt-1 text-sm font-bold text-navy-900">{registeredSuccess.name}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-muted">Selected Category:</span>
                        <p className="mt-1 text-sm font-bold text-navy-900">{registeredSuccess.category} Member</p>
                      </div>
                      <div>
                        <span className="font-semibold text-muted">Application Status:</span>
                        <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-800">
                          <span>Pending Verification</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-navy-100 pt-4 text-xs text-muted">
                      <p>
                        <strong>Next Steps:</strong> An administrative officer will review your submission and initiate membership card issuance. You can track your membership status in the public directory using your Membership ID.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setRegisteredSuccess(null);
                        setActiveTab('directory');
                        loadDirectory(1);
                      }}
                      className="rounded-full bg-navy-900 px-8 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-navy-800"
                    >
                      View Directory
                    </button>
                    <button
                      onClick={() => setRegisteredSuccess(null)}
                      className="rounded-full border border-navy-200 bg-white px-8 py-3.5 text-xs font-bold text-navy-900 transition hover:border-gold-400"
                    >
                      Register Another Member
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100 sm:p-10">
                  <div className="border-b border-navy-100 pb-6">
                    <span className="rounded-full bg-gold-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-gold-700">
                      Official Enrolment
                    </span>
                    <h2 className="mt-3 text-2xl font-black text-navy-900 sm:text-3xl">
                      Membership Application Form
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-muted">
                      Please enter accurate details as per your official legal credentials. Your Membership ID will be generated automatically.
                    </p>
                  </div>

                  {regError && (
                    <div className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700 ring-1 ring-red-200">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="mt-8 flex flex-col gap-8 text-[9px] sm:text-xs">
                    {/* SECTION 1: Personal Details */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-black text-navy-900">
                        <User className="h-4 w-4 text-gold-500" />
                        <span>1. Personal & Professional Information</span>
                      </h3>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block font-bold uppercase tracking-wider text-navy-900">
                            Full Legal Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">
                            Designation / Profession *
                          </label>
                          <input
                            type="text"
                            required
                            value={regDesignation}
                            onChange={(e) => setRegDesignation(e.target.value)}
                            
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">
                            Gender
                          </label>
                          <select
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value)}
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">
                            Date of Birth (YYYY-MM-DD)
                          </label>
                          <input
                            type="date"
                            value={regDob}
                            onChange={(e) => setRegDob(e.target.value)}
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">
                            Organization 
                          </label>
                          <input
                            type="text"
                            value={regOrganization}
                            onChange={(e) => setRegOrganization(e.target.value)}
                            
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>


                    {/* SECTION 6: Member Photo Upload */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-black text-navy-900">
                        <Upload className="h-4 w-4 text-gold-500" />
                        <span>2. Member Photo (For ID Card & Directory)</span>
                      </h3>

                      <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-navy-200 bg-mist/50 p-6 sm:flex-row">
                        {photoPreview ? (
                          <div className="relative">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="h-24 w-24 rounded-2xl object-cover ring-2 ring-gold-400 shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoFile(null);
                                setPhotoPreview(null);
                              }}
                              className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-md hover:bg-red-700"
                              title="Remove photo"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-navy-100 text-navy-400 ring-1 ring-navy-200">
                            <User className="h-10 w-10" />
                          </div>
                        )}

                        <div className="flex-1 text-center sm:text-left">
                          <p className="font-bold text-navy-900">Upload Formal Passport-style Photo</p>
                          <p className="mt-1 text-[11px] text-muted">
                            Supported formats: JPG, PNG, WEBP. Maximum file size: 5MB.
                          </p>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handlePhotoChange}
                            className="mt-3 block w-full text-xs text-muted file:mr-4 file:rounded-full file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-navy-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Contact Information */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-black text-navy-900">
                        <Mail className="h-4 w-4 text-gold-500" />
                        <span>3. Contact Details</span>
                      </h3>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">
                            Mobile Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={regMobile}
                            onChange={(e) => setRegMobile(e.target.value)}
                            
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">
                            Location / Area *
                          </label>
                          <input
                            type="text"
                            required
                            value={regLocation}
                            onChange={(e) => setRegLocation(e.target.value)}
                            
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">
                            Full Postal Address
                          </label>
                          <input
                            type="text"
                            value={regAddress}
                            onChange={(e) => setRegAddress(e.target.value)}
                            
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Membership Category */}
                    {/* <div>
                      <h3 className="flex items-center gap-2 text-sm font-black text-navy-900">
                        <Shield className="h-4 w-4 text-gold-500" />
                        <span>3. Membership Category & Plan *</span>
                      </h3>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {[
                          { id: 'Life', label: 'Life Member', desc: 'Lifetime enrolment & privileges' },
                          { id: 'Annual', label: 'Annual Member', desc: '12-month renewable subscription' },
                          { id: 'Student', label: 'Student Member', desc: 'For enrolled law & social students' },
                          { id: 'Corporate', label: 'Corporate Member', desc: 'For legal firms & institutions' },
                          { id: 'Honorary', label: 'Honorary Member', desc: 'Distinguished patrons & invitees' },
                        ].map((cat) => (
                          <label
                            key={cat.id}
                            className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all ${
                              regCategory === cat.id
                                ? 'border-gold-500 bg-gold-50/50 shadow-sm ring-1 ring-gold-400'
                                : 'border-navy-200 bg-mist hover:bg-white'
                            }`}
                          >
                            <div>
                              <input
                                type="radio"
                                name="membership_category"
                                value={cat.id}
                                checked={regCategory === cat.id}
                                onChange={(e) => setRegCategory(e.target.value)}
                                className="h-4 w-4 text-gold-500 focus:ring-gold-400"
                              />
                              <h4 className="mt-2 font-bold text-navy-900">{cat.label}</h4>
                              <p className="mt-1 text-[11px] text-muted">{cat.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div> */}

                    {/* SECTION 4: Payment Method */}
                    {/* <div>
                      <h3 className="flex items-center gap-2 text-sm font-black text-navy-900">
                        <CreditCard className="h-4 w-4 text-gold-500" />
                        <span>4. Payment Method & Fee Verification *</span>
                      </h3>

                      <div className="mt-4 rounded-2xl border border-navy-200 bg-mist p-5">
                        <label className="block font-bold uppercase tracking-wider text-navy-900 text-xs">
                          Choose How You Want to Pay *
                        </label>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label
                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                              regPaymentMethod === 'online'
                                ? 'border-gold-500 bg-gold-50/50 shadow-sm ring-1 ring-gold-400'
                                : 'border-navy-200 bg-white hover:bg-mist'
                            }`}
                          >
                            <input
                              type="radio"
                              name="reg_payment_method"
                              value="online"
                              checked={regPaymentMethod === 'online'}
                              onChange={() => setRegPaymentMethod('online')}
                              className="h-4 w-4 text-gold-500 focus:ring-gold-400"
                            />
                            <div>
                              <p className="font-bold text-navy-900 text-xs">💳 Online Payment</p>
                              <p className="mt-0.5 text-[11px] text-muted">UPI, Net Banking, or QR Transfer</p>
                            </div>
                          </label>

                          <label
                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
                              regPaymentMethod === 'cash'
                                ? 'border-gold-500 bg-gold-50/50 shadow-sm ring-1 ring-gold-400'
                                : 'border-navy-200 bg-white hover:bg-mist'
                            }`}
                          >
                            <input
                              type="radio"
                              name="reg_payment_method"
                              value="cash"
                              checked={regPaymentMethod === 'cash'}
                              onChange={() => setRegPaymentMethod('cash')}
                              className="h-4 w-4 text-gold-500 focus:ring-gold-400"
                            />
                            <div>
                              <p className="font-bold text-navy-900 text-xs">💵 Cash at Office</p>
                              <p className="mt-0.5 text-[11px] text-muted">Pay at desk in Bhubaneswar office</p>
                            </div>
                          </label>
                        </div>

                        {regPaymentMethod === 'online' && (
                          <div className="mt-4 border-t border-navy-200/60 pt-4 space-y-3">
                            <div>
                              <label className="block font-bold uppercase tracking-wider text-navy-900 text-xs">
                                Online Transaction ID / UTR / Reference No. *
                              </label>
                              <input
                                type="text"
                                required={regPaymentMethod === 'online'}
                                value={regPaymentReference}
                                onChange={(e) => setRegPaymentReference(e.target.value)}
                                placeholder="e.g. UPI / UTR / TXN12345678"
                                className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                              />
                            </div>
                            <div>
                              <label className="block font-bold uppercase tracking-wider text-navy-900 text-xs">
                                Amount Paid (₹) (Optional)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={regPaymentAmount}
                                onChange={(e) => setRegPaymentAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                              />
                            </div>
                            <p className="text-[11px] text-muted">
                              Please transfer your membership contribution via UPI / Netbanking and paste the reference or transaction ID here for instant verification.
                            </p>
                          </div>
                        )}

                        {regPaymentMethod === 'cash' && (
                          <div className="mt-4 border-t border-navy-200/60 pt-4 space-y-3">
                            <div>
                              <label className="block font-bold uppercase tracking-wider text-navy-900 text-xs">
                                Cash Amount to Deposit (₹) (Optional)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={regPaymentAmount}
                                onChange={(e) => setRegPaymentAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-white px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                              />
                            </div>
                            <p className="text-[11px] text-muted">
                              You may visit the Foundation's principal office in Bhubaneswar to deposit the membership fee in cash. An official receipt will be handed to you.
                            </p>
                          </div>
                        )}
                      </div>
                    </div> */}

                    {/* SECTION 5: Identity Documents */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-black text-navy-900">
                        <ShieldCheck className="h-4 w-4 text-gold-500" />
                        <span>4. PAN & Aadhaar Details</span>
                      </h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">PAN Number *</label>
                          <input
                            type="text"
                            required
                            maxLength={10}
                            value={regPanNumber}
                            onChange={(e) => setRegPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                            title="Enter a valid PAN, for example ABCDE1234F"
                            
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs uppercase text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-wider text-navy-900">Aadhaar Number *</label>
                          <input
                            type="text"
                            required
                            inputMode="numeric"
                            maxLength={12}
                            value={regAadhaarNumber}
                            onChange={(e) => setRegAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            pattern="[2-9][0-9]{11}"
                            title="Enter a valid 12-digit Aadhaar number"
                            
                            className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                          />
                        </div>
                        {[
                          { label: 'PAN Card', required: true, file: regPanCard, setFile: setRegPanCard },
                          { label: 'Aadhaar Card', required: true, file: regAadhaarCard, setFile: setRegAadhaarCard },
                        ].map(({ label, file, setFile }) => (
                          <div key={label}>
                            <label className="block font-bold uppercase tracking-wider text-navy-900">{label} *</label>
                            <input
                              type="file"
                              required
                              accept=".pdf,image/jpeg,image/png,image/webp"
                              onChange={(e) => {
                                const selected = e.target.files?.[0];
                                if (!selected) return;
                                if (selected.size > 5 * 1024 * 1024) {
                                  setRegError(`${label} must be smaller than 5MB.`);
                                  e.target.value = '';
                                  return;
                                }
                                setRegError(null);
                                setFile(selected);
                              }}
                              className="mt-1.5 block w-full rounded-2xl border border-navy-200 bg-mist px-3 py-2 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                            />
                            {file && <p className="mt-2 truncate text-[11px] text-gold-700">Selected: {file.name}</p>}
                          </div>
                        ))}
                      </div>

                      <div className="mt-5">
                        <label className="block font-bold uppercase tracking-wider text-navy-900">
                          Create Password *
                        </label>
                        <input
                          type="password"
                          required
                          minLength={8}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}"
                          title="Minimum 8 characters with uppercase, lowercase, number, and special character."
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist px-4 py-3 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                        />
                        <p className="mt-2 text-[11px] text-muted">
                          Must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.
                        </p>
                      </div>
                    </div>

                    

                    {/* SECTION 5: Additional Remarks */}
                    {/* <div>
                      <label className="block font-bold uppercase tracking-wider text-navy-900">
                        Areas of Interest / Remarks (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={regNotes}
                        onChange={(e) => setRegNotes(e.target.value)}
                        placeholder="Tell us about your legal aid, educational, or social interests..."
                        className="mt-1.5 w-full rounded-2xl border border-navy-200 bg-mist p-4 text-xs text-navy-900 outline-none transition focus:border-gold-500 focus:bg-white"
                      />
                    </div> */}

                    {/* Submit Button */}
                    <div className="border-t border-navy-100 pt-6">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 py-4 text-sm font-bold text-white shadow-lift transition duration-200 hover:-translate-y-0.5 hover:bg-navy-800 disabled:opacity-50"
                      >
                        {submitting ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4 text-gold-400" />
                        )}
                        <span>{submitting ? 'Submitting Application...' : 'Submit Membership Application'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Member Profile Modal Popup */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-navy-100 sm:p-8">
            <div className="flex items-start justify-between border-b border-navy-100 pb-4">
              <div className="flex items-center gap-3">
                {selectedMember.photo ? (
                  <img
                    src={selectedMember.photo}
                    alt={selectedMember.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-gold-400 shadow-md"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 ring-2 ring-gold-400/30">
                    <User className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black text-navy-900">{selectedMember.name}</h3>
                  <p className="text-xs font-semibold text-gold-700">
                    {selectedMember.designation || 'Member'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="rounded-full p-1.5 text-muted hover:bg-navy-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="flex justify-between rounded-xl bg-mist p-3">
                <span className="font-semibold text-muted">Membership ID</span>
                <span className="font-mono font-bold text-navy-900">{selectedMember.membership_id}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-mist p-3">
                <span className="font-semibold text-muted">Membership Category</span>
                <span className="font-bold text-navy-900">{selectedMember.category}</span>
              </div>
              <div className="flex justify-between rounded-xl bg-mist p-3">
                <span className="font-semibold text-muted">Location / Area</span>
                <span className="font-bold text-navy-900">{selectedMember.location || 'Odisha, India'}</span>
              </div>
              {selectedMember.organization && (
                <div className="flex justify-between rounded-xl bg-mist p-3">
                  <span className="font-semibold text-muted">Organization</span>
                  <span className="font-bold text-navy-900">{selectedMember.organization}</span>
                </div>
              )}
              <div className="flex justify-between rounded-xl bg-mist p-3">
                <span className="font-semibold text-muted">Approval Status</span>
                <span
                  className={`font-bold ${
                    selectedMember.membership_status === 'Approved'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {selectedMember.membership_status}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-mist p-3">
                <span className="font-semibold text-muted">Active Status</span>
                <span
                  className={`font-bold ${
                    selectedMember.is_active === 1 ? 'text-emerald-700' : 'text-zinc-500'
                  }`}
                >
                  {selectedMember.is_active === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
              {selectedMember.validity_end && (
                <div className="flex justify-between rounded-xl bg-mist p-3">
                  <span className="font-semibold text-muted">Validity</span>
                  <span className="font-bold text-navy-900">
                    {selectedMember.validity_start ? `${selectedMember.validity_start} to ` : ''}
                    {selectedMember.validity_end}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="mt-6 w-full rounded-full bg-navy-900 py-3 text-xs font-bold text-white shadow-md hover:bg-navy-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
