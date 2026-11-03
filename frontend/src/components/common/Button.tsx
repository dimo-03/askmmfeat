import { Link } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'gold' | 'navy' | 'outline' | 'outlineLight' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-offset-2';

const variants: Record<Variant, string> = {
  gold: 'bg-gold-500 text-navy-900 shadow-sm hover:bg-gold-400 hover:shadow-lift',
  navy: 'bg-navy-900 text-white shadow-sm hover:bg-navy-700 hover:shadow-lift',
  outline: 'border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white',
  outlineLight: 'border-2 border-white/80 text-white hover:bg-white hover:text-navy-900',
  ghost: 'text-navy-900 hover:bg-navy-50',
};

const sizes: Record<Size, string> = {
  md: 'px-6 py-3 text-sm sm:text-base',
  lg: 'px-8 py-4 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({ variant = 'gold', size = 'md', className = '', children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ to, variant = 'gold', size = 'md', className = '', children }: ButtonLinkProps) {
  return (
    <Link to={to} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}
