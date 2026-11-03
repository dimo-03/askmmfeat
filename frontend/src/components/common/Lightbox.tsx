import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LightboxProps {
  images: { src: string; alt: string; caption: string }[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export default function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const isOpen = index !== null;
  const total = images.length;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onIndexChange(((index as number) + 1) % total);
      if (event.key === 'ArrowLeft') onIndexChange(((index as number) - 1 + total) % total);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, index, total, onClose, onIndexChange]);

  if (index === null) return null;
  const current = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/95 p-4 animate-[fadeIn_0.3s_ease-out]"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onIndexChange((index - 1 + total) % total);
        }}
        aria-label="Previous image"
        className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <figure className="max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <img
          src={current.src}
          alt={current.alt}
          className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-lift"
        />
        <figcaption className="mt-4 text-center text-sm text-navy-100">
          {current.caption} ({index + 1} of {total})
        </figcaption>
      </figure>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onIndexChange((index + 1) % total);
        }}
        aria-label="Next image"
        className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
