import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import { FOUNDATION } from '@/data/site';

const ABOUT_IMAGE =
  'https://images.pexels.com/photos/18650478/pexels-photo-18650478.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function AboutPreviewSection() {
  return (
    <section className="section-y bg-white">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal animation="fade-in-right" className="relative">
          <div className="relative overflow-hidden rounded-3xl shadow-card">
            <img src={ABOUT_IMAGE} alt="Two children reading together in a bright classroom" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-gold-500 px-6 py-5 text-navy-900 shadow-lift sm:block">
            <p className="text-3xl font-bold">{FOUNDATION.established}</p>
            <p className="text-sm font-semibold">Year established</p>
          </div>
        </Reveal>

        <Reveal animation="fade-in-left" className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="About the Foundation"
            title={
              <>
                <span className="block sm:hidden">Honouring a Life</span>
                <span className="block sm:hidden">of Service Through</span>
                <span className="block sm:hidden">Education and Justice</span>
                <span className="hidden sm:block">Honouring a Life of Service Through Education and Justice</span>
              </>
            }
            align="left"
            titleClassName="text-[1.35rem] leading-tight sm:text-4xl"
          />
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            The {FOUNDATION.fullName} was formed in {FOUNDATION.established} to carry forward the values of
            Advocate Susil Kumar Mohapatra. Its work is rooted in education, justice, empowerment and service to the
            community.
          </p>
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            Through awareness, learning and welfare activities, the Foundation aims to create lasting opportunities for
            individuals and families.
          </p>
          <div>
            <ButtonLink to="/about" variant="navy">
              Read More
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
