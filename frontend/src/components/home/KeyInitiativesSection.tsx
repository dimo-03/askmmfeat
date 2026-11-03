import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FlipCard from '@/components/common/FlipCard';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import { INITIATIVES } from '@/data/site';

export default function KeyInitiativesSection() {
  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <Reveal animation="fade-in-down">
          <SectionHeading
            eyebrow="What We Do"
            title="Key Initiatives"
            description="Programmes the Foundation conducts across education, welfare, training and legal awareness."
          />
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {INITIATIVES.map((initiative, index) => (
            <Reveal key={initiative.slug} className="h-full" animation={index % 2 ? 'fade-in-left' : 'fade-in-right'} delay={index * 100}>
              <FlipCard
                className="h-full"
                compact
                front={
                  <div className="relative flex h-full min-h-[13rem] flex-col justify-end overflow-hidden rounded-2xl shadow-card sm:min-h-[18rem] sm:rounded-3xl">
                    <img src={initiative.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent" />
                    <div className="relative p-3 sm:p-6">
                      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500 text-navy-900 sm:mb-3 sm:h-12 sm:w-12 sm:rounded-xl">
                        <initiative.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                      </span>
                      <h3 className="text-sm font-bold leading-tight text-white sm:text-xl">{initiative.title}</h3>
                      {/* <p className="mt-2 text-sm text-navy-100">Hover or tap to learn more</p> */}
                    </div>
                  </div>
                }
                back={
                  <div className="flex h-full min-h-[13rem] flex-col justify-between rounded-2xl bg-navy-900 p-3.5 text-white shadow-card sm:min-h-[18rem] sm:rounded-3xl sm:p-7">
                    <div>
                      <h3 className="text-sm font-bold leading-tight text-gold-300 sm:text-xl">{initiative.title}</h3>
                      <p className="mt-2 line-clamp-3 text-[0.65rem] leading-tight text-navy-100 sm:mt-4 sm:text-sm sm:leading-relaxed">{initiative.summary}</p>
                    </div>
                    <Link
                      to={`/initiatives/${initiative.slug}`}
                      className="inline-flex items-center gap-1 self-start rounded-full bg-gold-500 px-3 py-1.5 text-[0.65rem] font-semibold text-navy-900 transition-colors hover:bg-gold-400 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                      Learn More
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                    </Link>
                  </div>
                }
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
