
import {
  Clock,
  Mail,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react';

import ContactForm from '@/components/forms/ContactForm';
import PageHeader from '@/components/common/PageHeader';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import SocialLinks from '@/components/common/SocialLinks';
import { CONTACT } from '@/data/site';
import useDocumentTitle from '@/hooks/useDocumentTitle';

const INFO = [
  { icon: MapPin, label: 'Office address', value: CONTACT.address },
  { icon: Phone, label: 'Phone', value: CONTACT.phone },
  { icon: Mail, label: 'Email', value: CONTACT.email },
  
];

export default function Contact() {
  useDocumentTitle('Contact Us - Get in Touch with the Foundation');

  return (
    <>
      <PageHeader
        title="Contact Us"
        description="Reach the Foundation with your questions, suggestions or partnership enquiries."
        image="https://images.pexels.com/photos/8199661/pexels-photo-8199661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Contact Us' },
        ]}
      />

      {/* Contact Information + Contact Form */}
      <section className="section-y bg-white">
        <div className="container-x grid min-w-0 items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">

          {/* Left Side - Contact Information */}
          <Reveal
            animation="fade-in-right"
            className="min-w-0 flex flex-col gap-8"
          >
            <SectionHeading
              align="left"
              eyebrow="Contact Information"
              title="We Would Love to Hear From You"
            />

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {INFO.map((item) => (
                <li
                  key={item.label}
                  className="flex min-w-0 gap-3 rounded-2xl bg-mist p-4 ring-1 ring-navy-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card sm:gap-4 sm:p-5"
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                    <item.icon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-gold-600">
                      {item.label}
                    </p>

                    <p className="mt-1 break-all text-sm font-medium leading-relaxed text-ink sm:break-words">
                      {item.value}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-navy-900">
                Follow the Foundation
              </p>

              <SocialLinks tone="light" />
            </div>
          </Reveal>

          {/* Right Side - Contact Form */}
          <Reveal
            animation="fade-in-left"
            delay={150}
            className="min-w-0 rounded-3xl bg-mist p-5 shadow-card ring-1 ring-navy-100 sm:p-8 lg:p-10"
          >
            <div className="mb-7">
              <SectionHeading
                align="left"
                eyebrow="Enquiry"
                title="Send Us a Message"
                description="Fields marked with an asterisk are required."
              />
            </div>

            <ContactForm />
          </Reveal>

        </div>
      </section>

      {/* Google Map - Above Footer */}
      <section className="section-y bg-mist">
        <div className="container-x">

          <Reveal animation="fade-in-up">
            <SectionHeading
              eyebrow="Find Us"
              title="Our Location"
              description="Find us on the map and plan your visit to the Foundation."
            />
          </Reveal>

          <Reveal
            animation="fade-in-up"
            delay={150}
            className="mt-10"
          >
            <div className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-card">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119743.53788645923!2d85.73805123197222!3d20.300864868626267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a1909d2d5170aa5%3A0xfc580e2b68b33fa8!2sBhubaneswar%2C%20Odisha!5e0!3m2!1sen!2sin!4v1793439889971!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="ASKMM Foundation Location - Bhubaneswar, Odisha"
                className="block h-72 w-full sm:h-[450px]"
              />
            </div>

            <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="flex items-center gap-2 text-sm font-medium text-navy-900">
                <MapPin
                  className="h-5 w-5 text-gold-600"
                  aria-hidden="true"
                />
                Bhubaneswar, Odisha
              </p>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Bhubaneswar%2C%20Odisha"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-card"
              >
                <Navigation className="h-4 w-4 text-gold-400" />
                Get Directions
              </a>
            </div>
          </Reveal>

        </div>
      </section>
    </>
  );
}
