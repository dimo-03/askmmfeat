import { BookOpen, Eye, Target, type LucideIcon } from 'lucide-react';
import Reveal, { type RevealAnimation } from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import TiltCard from '@/components/common/TiltCard';
import { MISSION_VISION_OBJECTIVES } from '@/data/site';

const CARDS: { key: keyof typeof MISSION_VISION_OBJECTIVES; icon: LucideIcon; animation: RevealAnimation }[] = [
  { key: 'mission', icon: Target, animation: 'zoom-in-up' },
  { key: 'vision', icon: Eye, animation: 'zoom-in' },
  { key: 'objectives', icon: BookOpen, animation: 'zoom-in-down' },
];

export default function MissionVisionSection() {
  return (
    <section className="section-y bg-mist">
      <div className="container-x">
        <Reveal animation="fade-in-down">
          <SectionHeading
            eyebrow="Our Purpose"
            title="Mission, Vision and Objectives"
            description="The principles that guide every programme the Foundation undertakes."
          />
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {CARDS.map(({ key, icon: Icon, animation }, index) => {
            const item = MISSION_VISION_OBJECTIVES[key];
            return (
              <Reveal key={key} animation={animation} delay={index * 150}>
                <TiltCard className="h-full">
                  <article className="group relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-card ring-1 ring-navy-100 transition-shadow duration-300 hover:shadow-lift">
                    <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-50 bg-gold-500 transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true" />
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                      <Icon className="h-8 w-8" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-muted">{item.body}</p>
                  </article>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
