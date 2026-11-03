import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ButtonLink } from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import EventCard from '@/components/events/EventCard';
import { EVENTS, INITIATIVES } from '@/data/site';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function InitiativeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const initiative = INITIATIVES.find((item) => item.slug === slug);
  useDocumentTitle(initiative ? `${initiative.title} - Our Initiatives` : 'Initiative not found');

  if (!initiative) {
    return (
      <section className="section-y bg-white">
        <div className="container-x flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-bold">Initiative not found</h1>
          <p className="max-w-md text-muted">The initiative you are looking for does not exist or has moved.</p>
          <ButtonLink to="/initiatives" variant="navy">
            View All Initiatives
          </ButtonLink>
        </div>
      </section>
    );
  }

  const relatedEvents = EVENTS.filter((event) => event.category === initiative.title);

  return (
    <>
      <PageHeader
        title={initiative.title}
        description={initiative.summary}
        image={initiative.image}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Our Initiatives', to: '/initiatives' },
          { label: initiative.title },
        ]}
      />

      <section className="section-y bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <Reveal animation="fade-in-right" className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Overview</h2>
              <span className="gold-rule" aria-hidden="true" />
              <p className="text-base leading-relaxed text-muted sm:text-lg">{initiative.overview}</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-lg font-bold">Objectives</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {initiative.objectives.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold">Activities</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {initiative.activities.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-3xl bg-mist p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Users className="h-5 w-5 text-gold-600" aria-hidden="true" />
                Intended Beneficiaries
              </h3>
              <ul className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
                {initiative.beneficiaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal animation="fade-in-left" delay={150} className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-3xl shadow-card">
              <img src={initiative.image} alt={`Photograph related to ${initiative.title}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="rounded-3xl border border-navy-100 p-6">
              <h3 className="text-lg font-bold">Verified results</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Verified outcomes for this initiative will be published here once the Foundation has confirmed them.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {relatedEvents.length > 0 && (
        <section className="section-y bg-mist">
          <div className="container-x">
            <Reveal animation="fade-in-down">
              <SectionHeading eyebrow="Related Events" title={`Events in ${initiative.title}`} />
            </Reveal>
            <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedEvents.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-navy-900 py-16 sm:py-20">
        <div className="container-x flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold text-white">Want to support {initiative.title.toLowerCase()}?</h2>
          <p className="max-w-2xl text-base text-navy-100">Volunteer your time or support the Foundation's programmes.</p>
          <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:gap-4">
            <ButtonLink
              to="/get-involved"
              variant="gold"
              size="lg"
              className="min-w-0 flex-1 whitespace-nowrap px-3 py-3 text-xs sm:flex-none sm:px-8 sm:py-4 sm:text-base"
            >
              Get Involved
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              to="/contact"
              variant="outlineLight"
              size="lg"
              className="min-w-0 flex-1 whitespace-nowrap px-3 py-3 text-xs sm:flex-none sm:px-8 sm:py-4 sm:text-base"
            >
              Contact Us
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
