import { FileDown, Images } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import { IMPACT_STATS, MILESTONES } from '@/data/site';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function Impact() {
  useDocumentTitle('Our Impact - Verified Statistics and Programme Outcomes');

  return (
    <>
      <PageHeader
        title="Our Impact"
        description="Verified statistics, activity summaries and programme outcomes. Figures are published only once confirmed."
        image="https://images.pexels.com/photos/12823567/pexels-photo-12823567.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Our Impact' }]}
      />

      <section className="section-y bg-white">
        <div className="container-x">
          <Reveal animation="fade-in-down">
            <SectionHeading eyebrow="Verified Statistics" title="Impact at a Glance" description="Values will replace the placeholders once the Foundation has verified its records." />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {IMPACT_STATS.map((stat, index) => (
              <Reveal key={stat.label} animation="zoom-in-up" delay={index * 110}>
                <div className="flex h-full flex-col gap-4 rounded-3xl bg-mist p-7 ring-1 ring-navy-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                  <stat.icon className="h-8 w-8 text-gold-600" aria-hidden="true" />
                  <p className="font-heading text-2xl font-bold text-navy-900">To be verified</p>
                  <p className="font-semibold">{stat.label}</p>
                  <p className="text-sm text-muted">{stat.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-mist">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <Reveal animation="fade-in-right">
            <SectionHeading align="left" eyebrow="Timeline" title="Year-wise Activity" description="Year-wise event summaries will be added as verified records become available." />
            <ol className="mt-10 flex flex-col gap-6 border-l-2 border-gold-500 pl-6">
              {MILESTONES.map((item) => (
                <li key={item.title} className="relative">
                  <span className="absolute -left-[2.1rem] top-1 h-4 w-4 rounded-full bg-gold-500 ring-4 ring-mist" aria-hidden="true" />
                  <p className="text-sm font-bold text-gold-600">{item.year}</p>
                  <p className="font-semibold">{item.title}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal animation="fade-in-left" delay={150} className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-navy-100">
              <h3 className="text-xl font-bold">Programme Outcomes</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Outcome summaries and beneficiary information will be published for each initiative after verification.
              </p>
            </div>
            <div className="flex items-start gap-4 rounded-3xl bg-navy-900 p-8 text-white">
              <FileDown className="h-7 w-7 flex-shrink-0 text-gold-300" aria-hidden="true" />
              <div>
                <h3 className="text-xl font-bold text-white">Annual Reports</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-100">
                  Downloadable annual reports will be listed here once they have been approved and published.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-white">
        <Reveal animation="fade-in-up" className="container-x flex flex-col items-center gap-6 text-center">
          <Images className="h-10 w-10 text-gold-600" aria-hidden="true" />
          <h2 className="text-2xl font-bold sm:text-3xl">Photographic Evidence</h2>
          <p className="max-w-2xl text-muted">Explore photographs from the programmes that make up our impact.</p>
          <ButtonLink to="/gallery" variant="navy">
            View the Gallery
          </ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
