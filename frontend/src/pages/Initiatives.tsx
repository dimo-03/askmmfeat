import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import FlipCard from '@/components/common/FlipCard';
import { INITIATIVES } from '@/data/site';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function Initiatives() {
  useDocumentTitle('Our Initiatives - Education, Social Welfare and Community Development');

  return (
    <>
      <PageHeader
        title="Our Initiatives"
        description="Education, social welfare, training and legal awareness programmes carried out by the Foundation."
        image="https://images.pexels.com/photos/8364069/pexels-photo-8364069.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Our Initiatives' }]}
      />

      <section className="section-y bg-white">
        <div className="container-x">
          <Reveal animation="fade-in-down">
            <SectionHeading
              eyebrow="Programmes"
              title="Choose an Area of Work"
              description="Each initiative has its own page with objectives, activities, beneficiaries and related events."
            />
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {INITIATIVES.map((initiative, index) => (
              <Reveal key={initiative.slug} animation="zoom-in" delay={index * 110}>
                <FlipCard
                  className="h-full"
                  front={
                    <div className="flex h-full min-h-[29rem] flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-100 md:min-h-[22rem]">
                      <img src={initiative.image} alt="" loading="lazy" className="h-44 w-full object-cover" />
                      <div className="flex flex-1 flex-col gap-4 p-6">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                          <initiative.icon className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <h2 className="text-xl font-bold">{initiative.title}</h2>
                        <p className="text-sm leading-relaxed text-muted">{initiative.summary}</p>
                      </div>
                    </div>
                  }
                  back={
                    <div className="flex h-full min-h-[29rem] flex-col justify-between rounded-3xl bg-navy-900 p-7 text-white shadow-card md:min-h-[22rem]">
                      <ul className="flex flex-col gap-3 text-sm text-navy-100">
                        {initiative.activities.slice(0, 3).map((activity) => (
                          <li key={activity} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-400" aria-hidden="true" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to={`/initiatives/${initiative.slug}`}
                        className="inline-flex items-center gap-2 self-start rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-400"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  }
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
