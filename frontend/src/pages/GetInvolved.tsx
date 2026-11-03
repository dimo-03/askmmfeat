
import {
  Briefcase,
  Handshake,
  HeartHandshake,
  Megaphone,
  Sprout,
  ArrowRight,
  Users,
  Heart,
} from 'lucide-react';

import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import VolunteerForm from '@/components/forms/VolunteerForm';
import useDocumentTitle from '@/hooks/useDocumentTitle';

const OPTIONS = [
  {
    icon: HeartHandshake,
    title: 'Volunteering',
    body: 'Give your time to outreach, welfare drives and events.',
    number: '01',
  },
  {
    icon: Sprout,
    title: 'Educational Programmes',
    body: 'Support students through tutoring, mentoring and learning sessions.',
    number: '02',
  },
  {
    icon: Megaphone,
    title: 'Community Activities',
    body: 'Join awareness campaigns and public welfare activities.',
    number: '03',
  },
  {
    icon: Briefcase,
    title: 'Professional Skills',
    body: 'Offer your expertise in law, teaching, training or administration.',
    number: '04',
  },
  {
    icon: Handshake,
    title: 'Collaboration',
    body: 'Partner with the Foundation on joint programmes and initiatives.',
    number: '05',
  },
];

export default function GetInvolved() {
  useDocumentTitle('Get Involved - Volunteer with the Foundation');

  return (
    <>
      <PageHeader
        title="Get Involved"
        description="Volunteer, participate, collaborate or support approved programmes. Every contribution helps."
        image="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Get Involved' },
        ]}
      />

      {/* Ways to Contribute */}
      <section className="relative overflow-hidden bg-white section-y">
        {/* Decorative Background */}
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-navy-100/60 blur-3xl" />

        <div className="container-x relative">
          <Reveal animation="fade-in-down">
            <SectionHeading
              eyebrow="Ways to Contribute"
              title="Be a Part of Something Meaningful"
              description="There are many ways to make a difference. Choose how you would like to contribute and become part of our mission."
              singleLineMobile
            />
          </Reveal>

          <div className="mt-14 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {OPTIONS.map((option, index) => (
              <Reveal
                key={option.title}
                animation="zoom-in"
                delay={index * 90}
                className="h-full"
              >
                <div className="group relative flex h-full min-h-[150px] items-center gap-5 overflow-hidden rounded-2xl border border-navy-100 bg-mist p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:bg-white hover:shadow-xl sm:p-6">

                  {/* Decorative Number */}
                  <span className="absolute right-4 top-3 text-4xl font-black text-navy-900/[0.045] transition-colors duration-300 group-hover:text-gold-500/20">
                    {option.number}
                  </span>

                  {/* Icon */}
                  <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-gold-400 group-hover:text-navy-900">
                    <option.icon
                      className="h-7 w-7"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Text Beside Icon */}
                  <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-2">
                    <h3 className="text-base font-bold leading-snug text-navy-900 transition-colors duration-300 group-hover:text-gold-700 sm:text-lg">
                      {option.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-muted">
                      {option.body}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gold-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                      Be a part
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Gold Bottom Accent */}
                  <span className="absolute bottom-0 left-0 h-1 w-0 bg-gold-500 transition-all duration-500 group-hover:w-full" />
                </div>
              </Reveal>
            ))}
          </div>

          {/* Contribution Highlight */}
          <Reveal animation="fade-in-up" delay={250}>
            <div className="relative mt-12 overflow-hidden rounded-3xl bg-navy-900 px-6 py-8 shadow-xl sm:px-10 sm:py-9">
              <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />

              <div className="relative flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-navy-900">
                    <Heart className="h-7 w-7 fill-current" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">
                      Together, We Can Make a Difference
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      Your time, skills and commitment can create lasting positive change.
                    </p>
                  </div>
                </div>

                <a
                  href="#volunteer-registration"
                  className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-bold text-navy-900 transition-all duration-300 hover:-translate-y-1 hover:bg-gold-300 hover:shadow-lg"
                >
                  Join Us
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Volunteer Registration */}
      <section
        id="volunteer-registration"
        className="relative overflow-hidden bg-mist section-y"
      >
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />

        <div className="container-x relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">

          <Reveal
            animation="fade-in-right"
            className="flex flex-col gap-6"
          >
            <SectionHeading
              align="left"
              eyebrow="Volunteer Registration"
              title="Register as a Volunteer"
              description="Share a few details and we will get in touch about suitable opportunities. Fields marked with an asterisk are required."
            />

            <div className="rounded-2xl bg-navy-900 p-6 text-white shadow-card">
              <div className="flex items-center gap-3">
                <Users className="h-7 w-7 text-gold-400" />

                <h3 className="text-lg font-bold">
                  Become Part of Our Community
                </h3>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Whether you can offer your time, knowledge or professional
                skills, your involvement can help us reach more people
                and strengthen our community initiatives.
              </p>

              <div className="mt-5 h-1 w-16 rounded-full bg-gold-400" />
            </div>
          </Reveal>

          <Reveal
            animation="fade-in-left"
            delay={150}
            className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100 sm:p-10"
          >
            <VolunteerForm />
          </Reveal>

        </div>
      </section>
    </>
  );
}
