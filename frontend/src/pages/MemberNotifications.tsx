import { useEffect, useState } from 'react';
import { Bell, ShieldCheck } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';
import type { MemberNotification } from '@/types/api';

export default function MemberNotifications() {
  const token = localStorage.getItem('askmm_member_token');
  const location = useLocation();
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api.members.getNotifications(token)
      .then((data) => {
        setNotifications(data.notifications);
        Promise.all(data.notifications.filter((item) => !item.is_read).map((item) => api.members.markNotificationRead(token, item.id))).catch(() => {});
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return <Navigate to="/member/login" replace state={{ from: location.pathname }} />;

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#F8F6F0] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Member Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-navy-900">Notifications</h1>
        </div>
        {loading && <div className="rounded-3xl bg-white p-8 text-center text-sm text-muted shadow-card ring-1 ring-navy-100">Loading notifications...</div>}
        {error && <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}
        {!loading && notifications.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-navy-100">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-600">
              <Bell className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-navy-900">You're all caught up</h2>
            <p className="mt-2 text-sm text-navy-600">Foundation announcements and member updates will appear here.</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-50 px-4 py-2 text-xs font-semibold text-navy-700">
              <ShieldCheck className="h-4 w-4 text-gold-600" />
              Protected member area
            </div>
          </div>
        )}
        {!loading && notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <article key={notification.id} className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-navy-100 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600"><Bell className="h-5 w-5" /></span>
                  <div>
                    <h2 className="font-bold text-navy-900">{notification.title}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">{notification.message}</p>
                    <p className="mt-3 text-[11px] text-navy-400">{notification.created_at}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
