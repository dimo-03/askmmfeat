import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FoundationEvent } from '@/data/site';

interface EventCardProps {
  event: FoundationEvent;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            event.status === 'Upcoming' ? 'bg-gold-500 text-navy-900' : 'bg-white text-navy-900'
          }`}
        >
          {event.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-green">{event.category}</p>
        <h3 className="text-xl font-bold">{event.title}</h3>
        <ul className="flex flex-col gap-2 text-sm text-muted">
          <li className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold-600" aria-hidden="true" />
            {event.date}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
            {event.location}
          </li>
        </ul>
        <p className="flex-1 text-sm leading-relaxed text-muted">{event.summary}</p>
        <Link
          to={`/events/${event.slug}`}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-navy-900 transition-colors hover:text-gold-600"
        >
          Read More
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
