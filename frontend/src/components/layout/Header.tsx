import { useEffect, useState } from 'react';
import { Bell, ChevronDown, Heart, Menu, UserRound, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FOUNDATION, INITIATIVES, NAV_LINKS } from '@/data/site';
import { Button } from '@/components/common/Button';
import { useDonateModal } from '@/hooks/useDonateModal';
import MobileMenu from '@/components/layout/MobileMenu';
import api from '@/lib/api';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative whitespace-nowrap py-2 text-sm font-medium transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-gold-400 after:transition-transform after:duration-300 hover:text-gold-300 hover:after:scale-x-100 ${
    isActive ? 'text-gold-300 after:scale-x-100' : 'text-white'
  }`;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [memberLoggedIn, setMemberLoggedIn] = useState(() => Boolean(localStorage.getItem('askmm_member_token')));
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { openDonate } = useDonateModal();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDropdownOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const syncMemberSession = () => setMemberLoggedIn(Boolean(localStorage.getItem('askmm_member_token')));
    syncMemberSession();
    window.addEventListener('storage', syncMemberSession);
    return () => window.removeEventListener('storage', syncMemberSession);
  }, [location.pathname]);

  useEffect(() => {
    if (!memberLoggedIn) {
      setUnreadNotifications(0);
      return;
    }
    const token = localStorage.getItem('askmm_member_token') || '';
    const loadUnread = () => {
      api.members.getNotifications(token).then((data) => setUnreadNotifications(data.unread_count)).catch(() => {});
    };
    loadUnread();
    const interval = window.setInterval(loadUnread, 30000);
    return () => window.clearInterval(interval);
  }, [memberLoggedIn, location.pathname]);

  const closeAll = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setMemberMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full flex-shrink-0 bg-navy-900 text-white transition-shadow duration-300 ${
        scrolled ? 'shadow-lift' : 'shadow-sm'
      }`}
    >
      <div className="h-1 w-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" aria-hidden="true" />
      <div className="container-x flex h-20 items-center justify-between gap-4">
        <Link to="/" onClick={closeAll} className="flex min-w-0 items-center gap-2 rounded-lg" aria-label="Go to homepage">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-md ring-2 ring-gold-400/70 transition-transform duration-500 hover:rotate-6">
            <img src={FOUNDATION.logo} alt="Foundation emblem" className="h-full w-full object-contain" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="hidden whitespace-nowrap text-sm font-bold text-white xl:block">{FOUNDATION.shortName}</span>
            <span className="block whitespace-nowrap text-xs font-bold text-white sm:text-sm xl:hidden">{FOUNDATION.shortName}</span>
            <span className="hidden text-xs text-gold-300 sm:block xl:hidden">Education, Justice, Empowerment</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((item) =>
            item.to === '/initiatives' ? (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  type="button"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  onClick={() => setDropdownOpen((open) => !open)}
                  className={`flex items-center gap-1 whitespace-nowrap py-2 text-sm font-medium transition-colors hover:text-gold-300 ${
                    location.pathname.startsWith('/initiatives') ? 'text-gold-300' : 'text-white'
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={`absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 transition-all duration-300 ${
                    dropdownOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
                  }`}
                >
                  <ul className="overflow-hidden rounded-2xl bg-white p-2 text-ink shadow-lift ring-1 ring-navy-100">
                    <li>
                      <Link
                        to="/initiatives"
                        onClick={closeAll}
                        className="block rounded-xl px-4 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
                      >
                        All Initiatives
                      </Link>
                    </li>
                    {INITIATIVES.map((initiative) => (
                      <li key={initiative.slug}>
                        <Link
                          to={`/initiatives/${initiative.slug}`}
                          onClick={closeAll}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-ink transition-colors hover:bg-gold-50 hover:text-navy-900"
                        >
                          <initiative.icon className="h-4 w-4 text-gold-600" aria-hidden="true" />
                          {initiative.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="gold" size="md" onClick={openDonate} className="hidden flex-shrink-0 whitespace-nowrap sm:inline-flex">
            <Heart className="h-4 w-4" aria-hidden="true" />
            Donate Now
          </Button>
          {memberLoggedIn && (
            <Link
              to="/member/notifications"
              aria-label="Member notifications"
              title="Notifications"
              className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-gold-400 hover:bg-gold-400/10 hover:text-gold-300"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadNotifications > 0 && (
                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-black text-navy-900 ring-2 ring-navy-900" aria-label={`${unreadNotifications} unread notifications`}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMemberMenuOpen((open) => !open)}
              aria-expanded={memberMenuOpen}
              aria-haspopup="menu"
              aria-label="Member account menu"
              title="Member account"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-gold-400 hover:bg-gold-400/10 hover:text-gold-300"
            >
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </button>
            {memberMenuOpen && (
              <div role="menu" className="absolute right-0 top-full mt-3 w-52 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white p-2 text-navy-900 shadow-lift ring-1 ring-navy-100">
                <Link
                  to="/member/login"
                  role="menuitem"
                  onClick={closeAll}
                  className="block rounded-xl px-4 py-3 text-xs font-semibold transition-colors hover:bg-gold-50 hover:text-gold-700"
                >
                  Member Login
                </Link>
                <Link
                  to="/membership"
                  role="menuitem"
                  onClick={closeAll}
                  className="block rounded-xl px-4 py-3 text-xs font-semibold transition-colors hover:bg-gold-50 hover:text-gold-700"
                >
                  Membership Registration
                </Link>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold-400 hover:text-gold-300 lg:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onNavigate={closeAll} onDonate={() => { closeAll(); openDonate(); }} />
    </header>
  );
}
