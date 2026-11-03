import { useEffect, useState } from 'react';
import { Lightbulb, Users } from 'lucide-react';
import LeaderCard from '@/components/leadership/LeaderCard';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import { LEADERSHIP } from '@/data/site';
import api from '@/lib/api';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function Leadership() {
  useDocumentTitle('Leadership and Core Team - Foundation Office Bearers');
  const [teamState, setTeamState] = useState(LEADERSHIP);

  useEffect(() => {
    let isMounted = true;
    api.team
      .getAll()
      .then((data) => {
        if (!isMounted || !data || data.length === 0) return;
        const chairman =
          data.find((m) => m.designation?.toLowerCase().includes('chair')) || LEADERSHIP.chairman;
        const secretary =
          data.find((m) => m.designation?.toLowerCase().includes('sec')) || LEADERSHIP.secretary;
        const trustees = data
          .filter((m) => m.designation?.toLowerCase().includes('trustee'))
          .map((m) => ({
            name: m.name,
            designation: m.designation || 'Trustee',
            bio: m.bio || 'Board Trustee',
          }));
        const officeBearers = data
          .filter(
            (m) =>
              !m.designation?.toLowerCase().includes('chair') &&
              !m.designation?.toLowerCase().includes('sec') &&
              !m.designation?.toLowerCase().includes('trustee')
          )
          .map((m) => ({
            name: m.name,
            designation: m.designation || 'Office Bearer',
            bio: m.bio || 'Core Team Member',
          }));

        setTeamState({
          chairman: {
            name: chairman.name,
            designation: chairman.designation || 'Chairman',
            bio: chairman.bio || LEADERSHIP.chairman.bio,
          },
          secretary: {
            name: secretary.name,
            designation: secretary.designation || 'Secretary',
            bio: secretary.bio || LEADERSHIP.secretary.bio,
          },
          trustees: trustees.length > 0 ? trustees : LEADERSHIP.trustees,
          officeBearers: officeBearers.length > 0 ? officeBearers : LEADERSHIP.officeBearers,
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Leadership and Core Team"
        description="The Chairman, Secretary, trustees and office bearers who guide the Foundation."
        image="https://images.pexels.com/photos/25856942/pexels-photo-25856942.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Our Team' }]}
      />

      <section className="section-y bg-white">
        <div className="container-x">
          <Reveal animation="fade-in-down">
            <SectionHeading eyebrow="Leadership" title="Chairman and Secretary" />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Reveal animation="fade-in-right">
              <LeaderCard member={teamState.chairman} featured />
            </Reveal>
            <Reveal animation="fade-in-left" delay={150}>
              <LeaderCard member={teamState.secretary} featured />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-y bg-mist">
        <div className="container-x">
          <Reveal animation="fade-in-down">
            <SectionHeading eyebrow="Board" title="Trustees" description="Trustees oversee the Foundation's governance and programmes." />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamState.trustees.map((member, index) => (
              <Reveal key={`trustee-${index}`} animation="zoom-in" delay={index * 100}>
                <LeaderCard member={member} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-white">
        <div className="container-x">
          <Reveal animation="fade-in-down">
            <SectionHeading eyebrow="Office Bearers" title="Core Team" description="Office bearers who run the Foundation's day-to-day work." />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamState.officeBearers.map((member, index) => (
              <Reveal key={`bearer-${index}`} animation="zoom-in" delay={index * 100}>
                <LeaderCard member={member} />
              </Reveal>
            ))}
          </div>
          <Reveal animation="fade-in-up" delay={200} className="mt-14">
              <div className="flex flex-col items-start gap-4 rounded-3xl bg-navy-900 p-8 text-white sm:flex-row sm:items-center">
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gold-500 text-navy-900">
                  <Users className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Profiles are being finalised</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-100">
                    Names, designations, photographs and biographies will be added once approved by the Foundation. Until then,
                    the cards above show placeholders.
                  </p>
                </div>
                <Lightbulb className="hidden h-6 w-6 text-gold-300 sm:ml-auto sm:block" aria-hidden="true" />
              </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
