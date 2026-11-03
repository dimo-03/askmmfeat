import { useState } from 'react';
import { ChevronDown, Heart } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { INITIATIVES, NAV_LINKS } from '@/data/site';
import { Button } from '@/components/common/Button';

interface MobileMenuProps {
  open: boolean;
  onNavigate: () => void;
  onDonate: () => void;
}

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
    isActive ? 'bg-white/10 text-gold-300' : 'text-white hover:bg-white/5 hover:text-gold-300'
  }`;

export default function MobileMenu({ open, onNavigate, onDonate }: MobileMenuProps) {
  const [initiativesOpen, setInitiativesOpen] = useState(false);

  return (
    <div
      id="mobile-menu"
      className={`grid transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
    >
      <div className="overflow-hidden">
        <nav aria-label="Mobile navigation" className="container-x flex flex-col gap-1 border-t border-white/10 py-4">
          {NAV_LINKS.map((item) =>
            item.to === '/initiatives' ? (
              <div key={item.to}>
                <button
                  type="button"
                  aria-expanded={initiativesOpen}
                  onClick={() => setInitiativesOpen((value) => !value)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium text-white transition-colors hover:bg-white/5 hover:text-gold-300"
                >
                  {item.label}
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${initiativesOpen ? 'rotate-180' : ''}`} />
                </button>
                {initiativesOpen && (
                  <div className="ml-4 flex flex-col gap-1 border-l border-gold-500/60 pl-3 animate-[fadeInDown_0.3s_ease-out]">
                    <Link to="/initiatives" onClick={onNavigate} className="rounded-lg px-3 py-2 text-sm text-gold-300">
                      All Initiatives
                    </Link>
                    {INITIATIVES.map((initiative) => (
                      <Link
                        key={initiative.slug}
                        to={`/initiatives/${initiative.slug}`}
                        onClick={onNavigate}
                        className="rounded-lg px-3 py-2 text-sm text-navy-50 transition-colors hover:bg-white/5 hover:text-gold-300"
                      >
                        {initiative.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onNavigate} className={mobileLinkClass}>
                {item.label}
              </NavLink>
            )
          )}
          <Button variant="gold" size="lg" onClick={onDonate} className="mt-3 w-full">
            <Heart className="h-5 w-5" aria-hidden="true" />
            Donate Now
          </Button>
        </nav>
      </div>
    </div>
  );
}
