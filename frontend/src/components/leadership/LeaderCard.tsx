import { User } from 'lucide-react';
import type { TeamMember } from '@/data/site';

interface LeaderCardProps {
  member: TeamMember;
  featured?: boolean;
}

export default function LeaderCard({ member, featured = false }: LeaderCardProps) {
  return (
    <article
      className={`flex h-full flex-col items-center gap-5 rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-navy-100 transition-shadow duration-300 hover:shadow-lift ${
        featured ? 'sm:flex-row sm:text-left' : ''
      }`}
    >
      <span className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full border-4 border-gold-400 bg-navy-50 text-navy-400">
        <User className="h-12 w-12" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">{member.designation}</p>
        <h3 className="mt-2 text-xl font-bold">{member.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{member.bio}</p>
      </div>
    </article>
  );
}
