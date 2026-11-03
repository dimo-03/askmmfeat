import type { ComponentType, SVGProps } from 'react';
import { Facebook, Instagram, Youtube, type LucideIcon } from 'lucide-react';
import { SOCIAL_LINKS } from '@/data/site';

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>> | LucideIcon> = {
  Facebook,
  Instagram,
  YouTube: Youtube,
  'X (Twitter)': XIcon,
};

interface SocialLinksProps {
  tone?: 'light' | 'dark';
}

export default function SocialLinks({ tone = 'dark' }: SocialLinksProps) {
  const base =
    tone === 'dark'
      ? 'border-white/20 text-white hover:border-gold-400 hover:bg-gold-500 hover:text-navy-900'
      : 'border-navy-100 text-navy-900 hover:border-gold-500 hover:bg-gold-500 hover:text-navy-900';

  return (
    <ul className="flex items-center gap-3">
      {SOCIAL_LINKS.map((social) => {
        const Icon = ICONS[social.label];
        const className = `flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5 ${base}`;
        return (
          <li key={social.label}>
            {social.url ? (
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${social.label} (opens in a new tab)`}
                className={className}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </a>
            ) : (
              <span
                aria-label={`${social.label} profile link to be added`}
                title="Profile link to be added"
                className={`${className} cursor-not-allowed opacity-50`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
