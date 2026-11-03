
import { HandHeart } from 'lucide-react';
import { Button } from '@/components/common/Button';
import Reveal from '@/components/common/Reveal';
import { useDonateModal } from '@/hooks/useDonateModal';

export default function DonateCtaSection() {
  const { openDonate } = useDonateModal();

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-x">

        <Reveal animation="zoom-in">
          <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-5 py-10 text-center text-white shadow-2xl sm:px-12 sm:py-16">

            {/* Animated Background Blobs */}
            <div className="pointer-events-none absolute inset-0">
              <div className="animate-float-blob absolute -left-10 top-0 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />

              <div className="animate-float-blob absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-navy-500/40 blur-3xl [animation-delay:2s]" />
            </div>

            {/* Content */}
            <div className="relative">

              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-navy-900 shadow-lift sm:h-16 sm:w-16">
                <HandHeart className="h-8 w-8" aria-hidden="true" />
              </span>

              <h2 className="mt-5 text-xl font-bold leading-tight text-white sm:text-4xl">
                Your Support Can Make a Difference
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-navy-100 sm:text-lg">
                Join us in supporting education, empowering communities,
                and creating opportunities for a better future.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={openDonate}
                  className="whitespace-nowrap px-5 py-3 text-sm hover-pulse sm:px-8 sm:py-4 sm:text-base"
                >
                  Donate Now
                </Button>
              </div>

            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
