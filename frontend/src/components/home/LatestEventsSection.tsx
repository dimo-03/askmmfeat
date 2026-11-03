import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import EventCard from '@/components/events/EventCard';
import { EVENTS, type FoundationEvent } from '@/data/site';
import api from '@/lib/api';

export default function LatestEventsSection() {
  const [events, setEvents] = useState<FoundationEvent[]>(EVENTS.slice(0, 3));

  useEffect(() => {
    let isMounted = true;
    api.events
      .getAll({ limit: 3 })
      .then((data) => {
        if (!isMounted || !data || data.length === 0) return;
        const mapped: FoundationEvent[] = data.slice(0, 3).map((item) => {
          const isUpcoming = !item.event_date || new Date(item.event_date) >= new Date();
          return {
            slug:
              item.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || `event-${item.id}`,
            title: item.title,
            date: item.event_date || 'Date to be announced',
            location: 'Bhubaneswar, Odisha',
            status: isUpcoming ? 'Upcoming' : 'Completed',
            category: item.category || 'General',
            summary: item.description || '',
            image: item.photo || EVENTS[0]?.image || '',
            isSample: false,
          };
        });
        setEvents(mapped);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <Reveal animation="fade-in-down">
  <SectionHeading
    eyebrow="Latest Events"
    title={
      <>
        <span className="block sm:hidden">
          Recent Activities
          <span className="block">and Announcements</span>
        </span>
        <span className="hidden sm:inline">Recent Activities and Announcements</span>
      </>
    }
    description="Follow the Foundation's programmes, workshops and community events."
    titleClassName="text-xl sm:text-3xl lg:text-4xl"
  />
</Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <Reveal key={event.slug} animation="zoom-in" delay={index * 120}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
        <Reveal animation="fade-in-up" delay={200} className="mt-12 flex justify-center">
          <ButtonLink to="/events" variant="navy">
            View All Events
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
