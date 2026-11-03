import { ArrowRight, HandHeart, Sparkles } from 'lucide-react';
import { Button, ButtonLink } from '@/components/common/Button';
import Reveal from '@/components/common/Reveal';
import { FOUNDATION } from '@/data/site';
import { useDonateModal } from '@/hooks/useDonateModal';

const HERO_IMAGE =
  'https://images.pexels.com/photos/3231359/pexels-photo-3231359.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function HeroSection() {
  const { openDonate } = useDonateModal();

  return (
    <section className="relative isolate overflow-hidden bg-navy-900">
      <img
        src={HERO_IMAGE}
        alt="Schoolgirls in uniform listening attentively in a classroom"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40 animate-[zoomIn_2.5s_ease-out_both]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900 via-navy-900/85 to-navy-900/20" />
      {/* <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-navy-900 to-transparent" /> */}

      <div className="container-x grid min-h-[calc(100svh-84px)] min-w-0 items-center gap-12 py-16 lg:grid-cols-[1.25fr_0.75fr] lg:py-20">
        <div className="flex min-w-0 flex-col gap-7">
          <Reveal animation="fade-in-down">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300 backdrop-blur">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Established {FOUNDATION.established}
            </span>
          </Reveal>

          <Reveal animation="fade-in-right" delay={150}>
  <h1 className="text-xl font-bold leading-[1.15] text-white sm:text-5xl lg:text-5xl">
    <span className="block sm:hidden">A Vision for Education,</span>

    <span className="block whitespace-nowrap sm:hidden">
      <span className="text-gold-300">Equality</span> and
    </span>

    <span className="block sm:hidden">Empowerment</span>

    <span className="hidden sm:block">
      A Vision for Education,{' '}
      <span className="text-gold-300">Equality</span> and Empowerment
    </span>
  </h1>
</Reveal>

          <Reveal animation="fade-in-up" delay={300}>
            <p className="max-w-2xl text-sm leading-relaxed text-navy-100 sm:text-lg">
              {FOUNDATION.fullName} is committed to supporting education, empowering communities, promoting awareness,
              and contributing to meaningful social development.
            </p>
          </Reveal>

          <Reveal animation="fade-in-up" delay={450}>
            <div className="flex w-full min-w-0 flex-row items-stretch gap-2 sm:flex-wrap sm:gap-4">
              <ButtonLink
                to="/initiatives"
                variant="gold"
                size="lg"
                className="!flex min-w-0 flex-1 items-center justify-center gap-1 !px-2 !py-3 !text-xs leading-tight sm:flex-none sm:!px-8 sm:!py-4 sm:!text-base"
              >
                <span className="sm:hidden">Our Initiatives</span>
                <span className="hidden sm:inline">Explore Our Initiatives</span>
                <ArrowRight className="hidden h-5 w-5 flex-shrink-0 sm:block" aria-hidden="true" />
              </ButtonLink>

              <ButtonLink
                to="/get-involved"
                variant="outlineLight"
                size="lg"
                className="!flex min-w-0 flex-1 items-center justify-center !px-2 !py-3 !text-xs leading-tight sm:flex-none sm:!px-8 sm:!py-4 sm:!text-base"
              >
                Get Involved
              </ButtonLink>

              {/* <Button variant="navy" size="lg" onClick={openDonate} className="border border-gold-400/60 !bg-white/10 hover:!bg-white/20">
                <HandHeart className="h-5 w-5 text-gold-300" aria-hidden="true" />
                Donate Now
              </Button> */}
            </div>
          </Reveal>
        </div>

        {/* <Reveal animation="zoom-in" delay={400} duration={1} className="hidden justify-center lg:flex">
          <div className="relative flex h-80 w-80 items-center justify-center rounded-full border border-gold-400/40 bg-white/5 p-6 backdrop-blur-sm xl:h-96 xl:w-96">
            <div className="absolute inset-3 rounded-full border border-dashed border-gold-400/50 animate-[spin_40s_linear_infinite]" aria-hidden="true" />
            <img
              src={FOUNDATION.logo}
              alt="Emblem of the Advocate Susil Kumar Mohapatra Memorial Foundation"
              className="relative h-full w-full rounded-full bg-white object-contain p-4 shadow-lift"
            />
          </div>
        </Reveal> */}
      </div>
    </section>
  );
}