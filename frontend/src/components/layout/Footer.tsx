
import { Link } from 'react-router-dom';
import { CONTACT, FOUNDATION, INITIATIVES, NAV_LINKS } from '@/data/site';
import { Button } from '@/components/common/Button';
import SocialLinks from '@/components/common/SocialLinks';
import { useDonateModal } from '@/hooks/useDonateModal';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms and Conditions', to: '/terms' },
  { label: 'Admin Portal', to: '/admin' },
];

export default function Footer() {
  const { openDonate } = useDonateModal();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto bg-navy-900 text-navy-100">
      <div
        className="h-1 w-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"
        aria-hidden="true"
      />

      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">

        {/* Foundation Information */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 ring-2 ring-gold-400/70">
              <img
                src={FOUNDATION.logo}
                alt="ASKMM Foundation emblem"
                className="h-full w-full object-contain"
              />
            </span>

            <p className="font-heading text-xs font-bold leading-snug text-white">
              Advocate Susil Kumar Mohapatra Memorial Foundation and Educational Trust
            </p>
          </div>

          <p className="text-sm leading-relaxed text-navy-200">
            Established in {FOUNDATION.established} to continue a legacy of
            education, justice and service, and to support communities through
            meaningful social development.
          </p>

          <SocialLinks tone="dark" />
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gold-300">
            Contact
          </h2>

          <ul className="flex flex-col gap-4 text-sm">
            <li className="flex gap-3">
              <MapPin
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-400"
                aria-hidden="true"
              />
              <span>{CONTACT.address}</span>
            </li>

            <li className="flex gap-3">
              <Phone
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-400"
                aria-hidden="true"
              />
              <span>{CONTACT.phone}</span>
            </li>

            <li className="flex gap-3">
              <Mail
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-400"
                aria-hidden="true"
              />
              <span className="break-all">{CONTACT.email}</span>
            </li>
          </ul>

          <Button
            variant="gold"
            onClick={openDonate}
            className="w-full sm:w-auto"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            Donate Now
          </Button>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gold-300">
            Quick Links
          </h2>

          <ul className="mt-5 flex flex-col gap-3 text-sm">
            {NAV_LINKS.filter(
              (item) => item.to !== '/initiatives'
            ).map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="transition-colors hover:text-gold-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Our Initiatives */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-gold-300">
            Our Initiatives
          </h2>

          <ul className="mt-5 flex flex-col gap-3 text-sm">
            {INITIATIVES.map((initiative) => (
              <li key={initiative.slug}>
                <Link
                  to={`/initiatives/${initiative.slug}`}
                  className="transition-colors hover:text-gold-300"
                >
                  {initiative.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 text-xs text-navy-200 md:flex-row">

          {/* Copyright */}
          <p className="text-center md:text-left">
            © {year} ASKMM Foundation. All rights reserved.
          </p>

          {/* Privacy and Terms - Middle */}
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {legalLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="transition-colors hover:text-gold-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Developer Credit - Right Corner */}
          <p className="flex items-center justify-center gap-1.5 whitespace-nowrap">
            Made with
            <Heart
              size={13}
              className="fill-red-500 text-red-500"
              aria-label="love"
            />
            by
            <a
              href="https://walkdigitally.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white transition-colors hover:text-gold-300"
            >
              WalkDigitally
            </a>
          </p>

        </div>
      </div>
    </footer>
  );
}
