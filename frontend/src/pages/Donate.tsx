import { HeartHandshake, Receipt, ShieldCheck } from 'lucide-react';
import DonateForm from '@/components/donate/DonateForm';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function Donate() {
  useDocumentTitle('Donate - Support Education and Community Welfare');

  return (
    <>
      <PageHeader
        title="Donate"
        description="Support education, justice awareness and community welfare through the Foundation."
        image="https://images.pexels.com/photos/6994869/pexels-photo-6994869.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Donate' }]}
      />

      <section className="section-y bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <Reveal animation="fade-in-right" className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100 sm:p-10">
            <DonateForm />
          </Reveal>

          <Reveal animation="fade-in-left" delay={150} className="flex flex-col gap-6">
            <div className="rounded-3xl bg-navy-900 p-8 text-white">
              <HeartHandshake className="h-10 w-10 text-gold-400" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-bold text-white">Why your gift matters</h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-100">
                Your donation supports the Foundation's work in education, welfare, training and legal awareness.
              </p>
            </div>
            <div className="flex items-start gap-4 rounded-3xl bg-mist p-6 ring-1 ring-navy-100">
              <ShieldCheck className="mt-1 h-6 w-6 flex-shrink-0 text-brand-green" aria-hidden="true" />
              <div>
                <h3 className="font-bold">Secure and private</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Card and bank details are never entered on this website. Your personal details are used only as described
                  in the Privacy Policy.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-3xl bg-mist p-6 ring-1 ring-navy-100">
              <Receipt className="mt-1 h-6 w-6 flex-shrink-0 text-gold-600" aria-hidden="true" />
              <div>
                <h3 className="font-bold">Receipts and tax benefits</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Tax benefits and tax-compliant receipts will be offered only once the Foundation's eligibility and
                  documentation have been verified.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
