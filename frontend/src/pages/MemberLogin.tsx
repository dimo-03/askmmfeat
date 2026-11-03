import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FOUNDATION } from '@/data/site';
import api, { parseApiError } from '@/lib/api';

export default function MemberLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(() => localStorage.getItem('askmm_member_email') ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.members.login({ email: email.trim(), password });
      localStorage.setItem('askmm_member_token', result.token);
      localStorage.setItem('askmm_member', JSON.stringify(result.member));
      if (remember) localStorage.setItem('askmm_member_email', email.trim());
      else localStorage.removeItem('askmm_member_email');
      navigate(typeof location.state?.from === 'string' ? location.state.from : '/membership');
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#F8F6F0] px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-lift ring-1 ring-navy-100 sm:p-9">
        <Link to="/" className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white ring-2 ring-gold-400">
          <img src={FOUNDATION.logo} alt="ASKMM Foundation" className="h-full w-full rounded-full object-contain p-1" />
        </Link>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">ASKMM Foundation</p>
          <h1 className="mt-2 text-3xl font-bold text-navy-900">Member Login</h1>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-5">
          {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <label className="block text-sm font-semibold text-navy-900">
            Email address
            <span className="mt-2 flex items-center rounded-xl border border-navy-100 bg-[#F8F6F0] px-4 focus-within:border-gold-500">
              <Mail className="h-5 w-5 text-navy-400" aria-hidden="true" />
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 min-w-0 flex-1 bg-transparent px-3 outline-none" autoComplete="email" />
            </span>
          </label>
          <label className="block text-sm font-semibold text-navy-900">
            Password
            <span className="mt-2 flex items-center rounded-xl border border-navy-100 bg-[#F8F6F0] px-4 focus-within:border-gold-500">
              <LockKeyhole className="h-5 w-5 text-navy-400" aria-hidden="true" />
              <input required type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 min-w-0 flex-1 bg-transparent px-3 outline-none" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="p-2 text-navy-500 hover:text-gold-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>
          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-navy-700">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-[#D4AF37]" />
              Remember me
            </label>
            <Link to="/member/forgot-password" className="font-semibold text-gold-700 hover:text-gold-600">Forgot password?</Link>
          </div>
          <button disabled={loading} className="h-12 w-full rounded-full bg-gold-500 font-bold text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-60">{loading ? 'Signing in...' : 'Login'}</button>
          <p className="text-center text-sm text-navy-600">New member? <Link to="/membership" className="font-bold text-gold-700">Register membership</Link></p>
        </form>
      </div>
    </section>
  );
}
