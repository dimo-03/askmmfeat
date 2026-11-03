import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LoopCarouselProps {
  slides: ReactNode[];
  interval?: number;
  label: string;
}

export default function LoopCarousel({ slides, interval = 6000, label }: LoopCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const next = useCallback(() => setIndex((current) => (current + 1) % count), [count]);
  const prev = useCallback(() => setIndex((current) => (current - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setInterval(next, interval);
    return () => window.clearInterval(timer);
  }, [paused, next, interval, count]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-3xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              aria-hidden={slideIndex !== index}
              className="w-full flex-shrink-0"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 text-navy-900 transition-colors hover:border-gold-500 hover:bg-gold-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Go to slide ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  dotIndex === index ? 'w-8 bg-gold-500' : 'w-2.5 bg-navy-200 hover:bg-navy-300'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 text-navy-900 transition-colors hover:border-gold-500 hover:bg-gold-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}
