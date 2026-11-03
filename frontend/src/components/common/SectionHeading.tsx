import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  singleLineMobile?: boolean;
  titleClassName?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
  singleLineMobile = false,
  titleClassName,
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'mx-auto text-center items-center' : 'text-left items-start';
  const titleColor = tone === 'dark' ? 'text-white' : 'text-navy-900';
  const bodyColor = tone === 'dark' ? 'text-navy-100' : 'text-muted';
  const eyebrowColor = tone === 'dark' ? 'text-gold-300' : 'text-gold-600';

  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignment}`}>
      {eyebrow && (
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${eyebrowColor}`}>{eyebrow}</p>
      )}
      <h2
        className={`font-bold ${
          titleClassName ??
          (singleLineMobile
            ? 'whitespace-nowrap text-xs sm:text-4xl'
            : 'text-3xl sm:text-4xl')
        } ${titleColor}`}
      >
        {title}
      </h2>
      <span className={`gold-rule ${align === 'center' ? 'mx-auto' : ''}`} aria-hidden="true" />
      {description && <div className={`text-sm leading-relaxed sm:text-lg ${bodyColor}`}>{description}</div>}
    </div>
  );
}
