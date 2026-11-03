
import {
  Handshake,
  HeartHandshake,
  Megaphone,
  Sprout,
} from 'lucide-react';

import { ButtonLink } from '@/components/common/Button';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import TiltCard from '@/components/common/TiltCard';

const OPTIONS = [
  {
    icon: HeartHandshake,
    title: 'Volunteer',
    body: 'Give your time to education, welfare and community outreach.',
  },
  {
    icon: Megaphone,
    title: 'Join Events',
    body: 'Take part in awareness drives, workshops and community programmes.',
  },
  {
    icon: Handshake,
    title: 'Collaborate',
    body: 'Partner with us as an organisation, institution or professional.',
  },
  {
    icon: Sprout,
    title: 'Support Programmes',
    body: 'Back approved initiatives that create lasting opportunities.',
  },
];

export default function GetInvolvedSection() {
  return (
    <section className="section-y bg-white">
      <div className="container-x">

        <Reveal animation="fade-in-down">
          <SectionHeading
            eyebrow="Get Involved"
            title="Be Part of the Change"
            description="There are many ways to contribute your time, skills and support to the Foundation's work."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {OPTIONS.map((option, index) => (
            <Reveal
              key={option.title}
              animation="flip-in-x"
              delay={index * 120}
              className="h-full"
            >
              <TiltCard className="h-full">
                <div className="group flex h-full min-h-[115px] items-center gap-3 rounded-2xl border border-navy-100 bg-mist p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:bg-white hover:shadow-card sm:min-h-[150px] sm:gap-4 sm:rounded-3xl sm:p-5 lg:p-6">

                  {/* Icon */}
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-navy-900 shadow-sm transition-all duration-300 group-hover:bg-gold-500 group-hover:text-navy-900 group-hover:scale-105 sm:h-14 sm:w-14 sm:rounded-2xl">
                    <option.icon
                      className="h-5 w-5 sm:h-7 sm:w-7"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </span>

                  {/* Text Beside Icon */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-snug text-navy-900 sm:text-base lg:text-lg">
                      {option.title}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-muted sm:mt-2 sm:text-sm">
                      {option.body}
                    </p>
                  </div>

                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal
          animation="fade-in-up"
          delay={200}
          className="mt-9 flex justify-center sm:mt-12"
        >
          <ButtonLink to="/get-involved" variant="navy" size="lg">
            Become a Volunteer
          </ButtonLink>
        </Reveal>

      </div>
    </section>
  );
}
