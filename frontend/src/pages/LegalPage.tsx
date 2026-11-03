import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import { FOUNDATION } from '@/data/site';
import useDocumentTitle from '@/hooks/useDocumentTitle';

type LegalKind = 'privacy' | 'terms';

interface LegalSection {
  heading: string;
  body: string[];
}

const DOCUMENTS: Record<LegalKind, { title: string; intro: string; sections: LegalSection[] }> = {
  privacy: {
    title: 'Privacy Policy',
    intro: `This page explains how ${FOUNDATION.fullName} handles personal information submitted through this website.`,
    sections: [
      {
        heading: 'Information we collect',
        body: [
          'Donation, volunteer and contact forms ask for details such as your name, email address, phone number and message.',
          'Basic technical information may be collected by hosting providers to keep the website running securely.',
        ],
      },
      {
        heading: 'How we use information',
        body: [
          'We use your details only to respond to your enquiry, process your donation or manage your volunteer registration.',
          'We do not sell personal information.',
        ],
      },
      {
        heading: 'Payments',
        body: [
          "Card and bank details are never entered on or stored by this website. Payments will be handled by the Foundation's authorised payment partner once configured.",
        ],
      },
      {
        heading: 'Your choices',
        body: ['You may ask the Foundation to correct or delete your personal information by contacting us.'],
      },
    ],
  },
  terms: {
    title: 'Terms and Conditions',
    intro: `These terms apply to the use of the ${FOUNDATION.fullName} website.`,
    sections: [
      {
        heading: 'Use of this website',
        body: ['The website is provided to share information about the Foundation and to receive enquiries and donations.'],
      },
      {
        heading: 'Content',
        body: [
          'Text, photographs and other content belong to the Foundation or are used with permission. Please do not reuse them without written consent.',
        ],
      },
      {
        heading: 'Donations',
        body: [
          'Donations are voluntary. Tax benefits are available only where the Foundation has verified its eligibility and documentation.',
        ],
      },
      {
        heading: 'Changes',
        body: ['These terms may be updated from time to time. The latest version will always be shown on this page.'],
      },
    ],
  },
};

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const doc = DOCUMENTS[kind];
  useDocumentTitle(`${doc.title} - ${FOUNDATION.shortName}`);

  return (
    <>
      <PageHeader
        title={doc.title}
        
        image="https://images.pexels.com/photos/6077296/pexels-photo-6077296.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        crumbs={[{ label: 'Home', to: '/' }, { label: doc.title }]}
      />
      <section className="section-y bg-white">
        <div className="container-x max-w-4xl">
          <Reveal animation="fade-in-up" className="flex flex-col gap-10">
            
            <p className="text-base leading-relaxed text-muted sm:text-lg">{doc.intro}</p>
            {doc.sections.map((section) => (
              <div key={section.heading} className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
            <p className="text-sm text-muted">
              Questions?{' '}
              <Link to="/contact" className="font-semibold text-navy-900 underline decoration-gold-500 underline-offset-4">
                Contact the Foundation
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
