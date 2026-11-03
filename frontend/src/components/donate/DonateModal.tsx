
import { useEffect } from 'react';
import { X, Heart } from 'lucide-react';

import DonateForm from '@/components/donate/DonateForm';
import { FOUNDATION } from '@/data/site';

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DonateModal({
  open,
  onClose,
}: DonateModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    return () => {
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[40] flex items-end justify-center sm:items-center sm:p-5">

      {/* Background Overlay */}
      <button
        type="button"
        aria-label="Close donation window"
        onClick={onClose}
        className="absolute inset-0 bg-navy-900/75 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
      />

      {/* Donation Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-modal-title"
        className="relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift animate-[fadeInUp_0.45s_ease-out] sm:rounded-3xl"
      >

        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between gap-2 bg-navy-900 px-4 py-4 sm:items-center sm:px-8 sm:py-6 sm:gap-4">

          <div className="flex min-w-0 items-start gap-2 sm:items-center sm:gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold-400/15 sm:h-11 sm:w-11">
              <Heart className="h-5 w-5 fill-gold-400 text-gold-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
                Donate Now
              </p>

              <h2
                id="donate-modal-title"
                className="mt-1 text-xs leading-snug font-bold text-white sm:text-2xl"
              >
                Support {FOUNDATION.fullName}
              </h2>

              <p className="mt-1 text-[10px] leading-tight text-navy-200 sm:text-xs">
                Your contribution makes a difference.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close donation form"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:rotate-90 hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8">
          <DonateForm compact />
        </div>

      </div>
    </div>
  );
}
