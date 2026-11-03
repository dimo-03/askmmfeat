import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import LeaderCard from '@/components/leadership/LeaderCard';
import { LEADERSHIP } from '@/data/site';
import api from '@/lib/api';

export default function LeadershipPreviewSection() {
  const [chairman, setChairman] = useState(LEADERSHIP.chairman);
  const [secretary, setSecretary] = useState(LEADERSHIP.secretary);

  useEffect(() => {
    let isMounted = true;
    api.team
      .getAll()
      .then((data) => {
        if (!isMounted || !data || data.length === 0) return;
        const c = data.find((m) => m.designation?.toLowerCase().includes('chair'));
        const s = data.find((m) => m.designation?.toLowerCase().includes('sec'));
        if (c) setChairman({ name: c.name, designation: c.designation || 'Chairman', bio: c.bio || LEADERSHIP.chairman.bio });
        if (s) setSecretary({ name: s.name, designation: s.designation || 'Secretary', bio: s.bio || LEADERSHIP.secretary.bio });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="section-y bg-mist">
      <div className="container-x">
        <Reveal animation="fade-in-down">
          <SectionHeading eyebrow="Leadership" title="Guided by Dedicated Leaders" description="Profiles, photographs and biographies will be shown once approved by the Foundation." />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal animation="fade-in-right">
            <LeaderCard member={chairman} featured />
          </Reveal>
          <Reveal animation="fade-in-left" delay={150}>
            <LeaderCard member={secretary} featured />
          </Reveal>
        </div>
        <Reveal animation="fade-in-up" delay={250} className="mt-12 flex justify-center">
          <ButtonLink to="/leadership" variant="navy">
            View Our Team
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
