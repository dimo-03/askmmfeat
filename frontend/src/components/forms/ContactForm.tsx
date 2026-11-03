import { useState, type FormEvent } from 'react';
import { Info, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';
import FormField, { fieldBorder, fieldClass } from '@/components/forms/FormField';
import { isValidEmail, isValidPhone } from '@/components/forms/validation';
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

const EMPTY: ContactValues = { name: '', email: '', phone: '', subject: '', message: '', consent: false };

function validate(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!isValidEmail(values.email)) errors.email = 'Please enter a valid email address.';
  if (values.phone.trim() && !isValidPhone(values.phone)) errors.phone = 'Please enter a valid phone number.';
  if (values.subject.trim().length < 3) errors.subject = 'Please enter a subject.';
  if (values.message.trim().length < 10) errors.message = 'Please write at least 10 characters.';
  if (!values.consent) errors.consent = 'Please agree to the privacy notice.';
  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const update = <K extends keyof ContactValues>(key: K, value: ContactValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setChecked(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      setChecked(false);
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
      setChecked(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not submit your enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6" aria-label="Contact enquiry form">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="contact-name" label="Name" required error={errors.name}>
          <input
            id="contact-name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.name))}`}
          />
        </FormField>
        <FormField id="contact-email" label="Email" required error={errors.email}>
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
        <FormField id="contact-phone" label="Phone" error={errors.phone} hint="Optional">
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
        <FormField id="contact-subject" label="Subject" required error={errors.subject}>
          <input
            id="contact-subject"
            value={values.subject}
            onChange={(e) => update('subject', e.target.value)}
            aria-invalid={Boolean(errors.subject)}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.subject))}`}
          />
        </FormField>
      </div>
      <FormField id="contact-message" label="Message" required error={errors.message}>
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
          <span>I agree that my details may be used to reply to this enquiry, as described in the Privacy Policy.</span>
        </label>
        {errors.consent && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {errors.consent}
          </p>
        )}
      </div>

      <div>
        <Button type="submit" variant="navy" size="lg" disabled={submitting} className="w-full sm:w-auto">
          <Send className="h-5 w-5" aria-hidden="true" />
          {submitting ? 'Sending...' : 'Send Enquiry'}
        </Button>
      </div>

      {checked && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-gold-300 bg-gold-50 p-5 text-sm leading-relaxed text-navy-900">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
          <p>
            Thank you. Your enquiry has been submitted successfully.
          </p>
        </div>
      )}
      {submitError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {submitError}
        </div>
      )}
    </form>
  );
}
