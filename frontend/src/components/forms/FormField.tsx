import type { ReactNode } from 'react';

export const fieldClass =
  'w-full rounded-xl border bg-white px-4 py-3 text-base text-ink placeholder:text-slate-400 transition-colors duration-200 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-400/60';

export function fieldBorder(hasError: boolean): string {
  return hasError ? 'border-red-500' : 'border-navy-100';
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export default function FormField({ id, label, error, required, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-navy-900">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
