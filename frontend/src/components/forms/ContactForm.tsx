
import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Send, X } from 'lucide-react';

import { Button } from '@/components/common/Button';
import FormField, {
  fieldBorder,
  fieldClass,
} from '@/components/forms/FormField';
import {
  isValidEmail,
  isValidPhone,
} from '@/components/forms/validation';
import { postApi } from '@/lib/api';

interface ContactValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
}

type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMPTY: ContactValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  consent: false,
};

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Please enter your name.';
  }

  if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (values.phone.trim() && !isValidPhone(values.phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (values.subject.trim().length < 3) {
    errors.subject = 'Please enter a subject.';
  }

  if (values.message.trim().length < 10) {
    errors.message = 'Please write at least 10 characters.';
  }

  if (!values.consent) {
    errors.consent = 'Please agree to the privacy notice.';
  }

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const update = <K extends keyof ContactValues>(
    key: K,
    value: ContactValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));

    setErrors((prev) => ({
      ...prev,
      [key]: '',
    }));
  };

  // Lock background scrolling and support Escape key.
  useEffect(() => {
    if (!showThankYou) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowThankYou(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showThankYou]);

  const handleClosePopup = () => {
    setShowThankYou(false);
    setValues(EMPTY);
    setErrors({});
    setSubmitError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await postApi<{ message: string }>('/contact', {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        subject: values.subject.trim(),
        message: `${values.subject.trim()}\n\n${values.message.trim()}`,
      });

      // Show popup only after successful API submission.
      setShowThankYou(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Could not submit your enquiry. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-6"
        aria-label="Contact enquiry form"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            id="contact-name"
            label="Name"
            required
            error={errors.name}
          >
            <input
              id="contact-name"
              autoComplete="name"
              value={values.name}
              onChange={(e) => update('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              className={`${fieldClass} ${fieldBorder(Boolean(errors.name))}`}
            />
          </FormField>

          <FormField
            id="contact-email"
            label="Email"
            required
            error={errors.email}
          >
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              aria-invalid={Boolean(errors.email)}
              className={`${fieldClass} ${fieldBorder(Boolean(errors.email))}`}
            />
          </FormField>

          <FormField
            id="contact-phone"
            label="Phone"
            error={errors.phone}
            hint="Optional"
          >
            <input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => update('phone', e.target.value)}
              aria-invalid={Boolean(errors.phone)}
              className={`${fieldClass} ${fieldBorder(Boolean(errors.phone))}`}
            />
          </FormField>

          <FormField
            id="contact-subject"
            label="Subject"
            required
            error={errors.subject}
          >
            <input
              id="contact-subject"
              value={values.subject}
              onChange={(e) => update('subject', e.target.value)}
              aria-invalid={Boolean(errors.subject)}
              className={`${fieldClass} ${fieldBorder(Boolean(errors.subject))}`}
            />
          </FormField>
        </div>

        <FormField
          id="contact-message"
          label="Message"
          required
          error={errors.message}
        >
          <textarea
            id="contact-message"
            rows={5}
            maxLength={2000}
            value={values.message}
            onChange={(e) => update('message', e.target.value)}
            aria-invalid={Boolean(errors.message)}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.message))} resize-y`}
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-3 text-sm leading-relaxed text-ink">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(e) => update('consent', e.target.checked)}
              aria-invalid={Boolean(errors.consent)}
              className="mt-1 h-5 w-5 flex-shrink-0 rounded border-navy-200 text-navy-900 focus:ring-gold-400"
            />

            <span>
              I agree that my details may be used to reply to this enquiry,
              as described in the Privacy Policy.
            </span>
          </label>

          {errors.consent && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {errors.consent}
            </p>
          )}
        </div>

        <div>
          <Button
            type="submit"
            variant="navy"
            size="lg"
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            <Send className="h-5 w-5" aria-hidden="true" />

            {submitting ? 'Sending...' : 'Send Enquiry'}
          </Button>
        </div>

        {submitError && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {submitError}
          </div>
        )}
      </form>

      {/* Thank You Success Popup */}
      {showThankYou && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/75 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClosePopup();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="thank-you-title"
            aria-describedby="thank-you-description"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-7 text-center shadow-2xl ring-1 ring-gold-300 sm:p-10"
          >
            {/* Decorative top accent */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-navy-900 via-gold-400 to-navy-900" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClosePopup}
              aria-label="Close thank you popup"
              className="absolute right-4 top-4 rounded-full p-2 text-navy-500 transition hover:bg-mist hover:text-navy-900"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Success Icon */}
            <div className="mx-auto mt-3 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>

            {/* Success Content */}
            <span className="mt-7 inline-flex rounded-full bg-gold-50 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-gold-700">
              Enquiry Submitted
            </span>

            <h2
              id="thank-you-title"
              className="mt-5 text-2xl font-black leading-tight text-navy-900 sm:text-3xl"
            >
              Thank You for
              <span className="block text-gold-600">
                Contacting Us!
              </span>
            </h2>

            <p
              id="thank-you-description"
              className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-600"
            >
              Your enquiry has been submitted successfully. We truly appreciate
              your interest in our Foundation. Our team will review your
              message and get back to you soon.
            </p>

            {/* Divider */}
            <div className="mx-auto my-7 h-px w-20 bg-gold-300" />

            <p className="text-xs font-semibold text-navy-800">
              ASKMM Foundation
            </p>

            <p className="mt-1 text-[11px] text-slate-500">
              Thank you for reaching out to us.
            </p>

            {/* Close Action */}
            <button
              type="button"
              onClick={handleClosePopup}
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-navy-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
