import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import { EVENTS, INITIATIVES, type FoundationEvent } from '@/data/site';
import api from '@/lib/api';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { fieldClass } from '@/components/forms/FormField';

type StatusFilter = 'All' | 'Upcoming' | 'Completed';
const STATUS_OPTIONS: StatusFilter[] = ['All', 'Upcoming', 'Completed'];

export default function Events() {
  useDocumentTitle('Events and News - Foundation Activities and Announcements');
  const [eventsList, setEventsList] = useState<FoundationEvent[]>(EVENTS);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('All');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    let isMounted = true;
    api.events
      .getAll()
      .then((data) => {
        if (!isMounted || !data || data.length === 0) return;
        const mapped: FoundationEvent[] = data.map((item) => {
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
        setEventsList(mapped);
      })
      .catch(() => {
        // Keeps static EVENTS fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return eventsList.filter((event) => {
      if (status !== 'All' && event.status !== status) return false;
      if (category !== 'All' && event.category !== category) return false;
      if (!term) return true;
      return `${event.title} ${event.summary} ${event.location}`.toLowerCase().includes(term);
    });
  }, [eventsList, query, status, category]);

  return (
    <>
      <PageHeader
        title="Events and News"
        description="Upcoming programmes, completed activities and announcements from the Foundation."
        image="https://images.pexels.com/photos/8087867/pexels-photo-8087867.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Events' }]}
      />

      <section className="section-y bg-white">
        <div className="container-x">
          <Reveal animation="fade-in-down">
            <div className="flex flex-col gap-4 rounded-3xl bg-mist p-5 shadow-sm ring-1 ring-navy-100 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
                <label htmlFor="event-search" className="sr-only">
                  Search events
                </label>
                <input
                  id="event-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search events"
                  className={`${fieldClass} border-navy-100 pl-12`}
                />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div role="group" aria-label="Filter by status" className="flex rounded-full bg-white p-1 ring-1 ring-navy-100">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={status === option}
                      onClick={() => setStatus(option)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                        status === option ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-navy-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <label htmlFor="event-category" className="sr-only">
                  Filter by category
                </label>
                <select
                  id="event-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className={`${fieldClass} border-navy-100 sm:w-auto`}
                >
                  <option value="All">All categories</option>
                  {INITIATIVES.map((item) => (
                    <option key={item.slug} value={item.title}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Reveal>

          {filtered.length > 0 ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event, index) => (
                <Reveal key={event.slug} animation="fade-in-up" delay={index * 80}>
                  <EventCard event={event} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-12 rounded-3xl bg-mist p-10 text-center text-muted">
              No events match your search. Try a different keyword or filter.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
