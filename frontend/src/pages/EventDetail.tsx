import { CalendarDays, MapPin, Share2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ButtonLink } from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import { EVENTS } from '@/data/site';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const event = EVENTS.find((item) => item.slug === slug);
  useDocumentTitle(event ? `${event.title} - Events and News` : 'Event not found');

  if (!event) {
    return (
      <section className="section-y bg-white">
        <div className="container-x flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-bold">Event not found</h1>
          <p className="max-w-md text-muted">This event may have been archived or the link may be incorrect.</p>
          <ButtonLink to="/events" variant="navy">
            Back to Events
          </ButtonLink>
        </div>
      </section>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(`${event.title} - ${shareUrl}`);

  return (
    <>
      <PageHeader
        title={event.title}
        description={event.summary}
        image={event.image}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Events', to: '/events' },
          { label: event.title },
        ]}
      />

      <section className="section-y bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          <Reveal animation="fade-in-right" className="flex flex-col gap-8">
            <div className="overflow-hidden rounded-3xl shadow-card">
              <img src={event.image} alt={event.title} className="aspect-[16/9] w-full object-cover" />
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">About this event</h2>
              <span className="gold-rule" aria-hidden="true" />
              <p className="text-base leading-relaxed text-muted sm:text-lg">{event.summary}</p>
            </div>
          </Reveal>

          <Reveal animation="fade-in-left" delay={150}>
            <aside className="flex flex-col gap-6 rounded-3xl bg-mist p-8 ring-1 ring-navy-100">
              <span className="w-fit rounded-full bg-navy-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {event.status}
              </span>
              <ul className="flex flex-col gap-5 text-sm text-ink">
                <li className="flex gap-3">
                  <CalendarDays className="h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
                  {event.date}
                </li>
                <li className="flex gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
                  {event.location}
                </li>
              </ul>
              <div className="flex flex-col gap-3 border-t border-navy-100 pt-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Share this event
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/?text=${shareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-900 transition-colors hover:border-gold-500 hover:bg-gold-50"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-900 transition-colors hover:border-gold-500 hover:bg-gold-50"
                  >
                    X (Twitter)
                  </a>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="bg-navy-900 py-16">
        <div className="container-x flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">See more of our work</h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <ButtonLink to="/events" variant="gold">
              All Events
            </ButtonLink>
            <ButtonLink to="/gallery" variant="outlineLight">
              View Gallery
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
