import { useState, type FormEvent } from 'react';
import { Info, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';
import FormField, { fieldBorder, fieldClass } from '@/components/forms/FormField';
import { isValidEmail, isValidPhone } from '@/components/forms/validation';
import { INITIATIVES } from '@/data/site';
import { postApi } from '@/lib/api';

const AREAS = [...INITIATIVES.map((item) => item.title), 'Event Support', 'Fundraising', 'Other'];
const AVAILABILITY = ['Weekdays', 'Weekends', 'Evenings', 'Flexible', 'Only for specific events'];

interface VolunteerValues {
  name: string;
  email: string;
  phone: string;
  city: string;
  interests: string[];
  skills: string;
  availability: string;
  message: string;
  consent: boolean;
}

type VolunteerErrors = Partial<Record<keyof VolunteerValues, string>>;

const EMPTY: VolunteerValues = {
  name: '',
  email: '',
  phone: '',
  city: '',
  interests: [],
  skills: '',
  availability: '',
  message: '',
  consent: false,
};

function validate(values: VolunteerValues): VolunteerErrors {
  const errors: VolunteerErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your full name.';
  if (!isValidEmail(values.email)) errors.email = 'Please enter a valid email address.';
  if (!isValidPhone(values.phone)) errors.phone = 'Please enter a valid phone number.';
  if (values.city.trim().length < 2) errors.city = 'Please enter your city.';
  if (values.interests.length === 0) errors.interests = 'Please choose at least one area of interest.';
  if (!values.availability) errors.availability = 'Please choose your availability.';
  if (!values.consent) errors.consent = 'Please agree to be contacted.';
  return errors;
}

export default function VolunteerForm() {
  const [values, setValues] = useState<VolunteerValues>(EMPTY);
  const [errors, setErrors] = useState<VolunteerErrors>({});
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const update = <K extends keyof VolunteerValues>(key: K, value: VolunteerValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setChecked(false);
  };

  const toggleInterest = (area: string) => {
    const next = values.interests.includes(area)
      ? values.interests.filter((item) => item !== area)
      : [...values.interests, area];
    update('interests', next);
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
        message:
          `Volunteer registration\nCity: ${values.city.trim()}\nAreas of interest: ${values.interests.join(', ')}\n` +
          `Availability: ${values.availability}\nRelevant skills: ${values.skills.trim() || 'Not specified'}\n\n` +
          values.message.trim(),
      });
      setChecked(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not submit your registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6" aria-label="Volunteer registration form">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="vol-name" label="Full name" required error={errors.name}>
          <input
            id="vol-name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.name))}`}
          />
        </FormField>
        <FormField id="vol-email" label="Email" required error={errors.email}>
          <input
            id="vol-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.email))}`}
          />
        </FormField>
        <FormField id="vol-phone" label="Phone" required error={errors.phone}>
          <input
            id="vol-phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => update('phone', e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.phone))}`}
          />
        </FormField>
        <FormField id="vol-city" label="City" required error={errors.city}>
          <input
            id="vol-city"
            autoComplete="address-level2"
            value={values.city}
            onChange={(e) => update('city', e.target.value)}
            aria-invalid={Boolean(errors.city)}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.city))}`}
          />
        </FormField>
      </div>

      <fieldset className="flex flex-col gap-3" aria-describedby={errors.interests ? 'vol-interests-error' : undefined}>
        <legend className="mb-1 text-sm font-semibold text-navy-900">
          Areas of interest <span className="text-red-600">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AREAS.map((area) => {
            const active = values.interests.includes(area);
            return (
              <button
                key={area}
                type="button"
                aria-pressed={active}
                onClick={() => toggleInterest(area)}
                className={`flex min-h-10 items-center justify-center rounded-full border px-2 py-2 text-center text-xs font-medium leading-tight transition-all duration-200 hover:-translate-y-0.5 sm:px-3 sm:text-sm ${
                  active ? 'border-gold-500 bg-gold-500 text-navy-900' : 'border-navy-200 bg-white text-navy-900 hover:border-navy-400'
                }`}
              >
                {area}
              </button>
            );
          })}
        </div>
        {errors.interests && (
          <p id="vol-interests-error" role="alert" className="text-sm font-medium text-red-700">
            {errors.interests}
          </p>
        )}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="vol-skills" label="Relevant skills" hint="Optional">
          <input
            id="vol-skills"
            value={values.skills}
            onChange={(e) => update('skills', e.target.value)}
            placeholder="e.g. teaching, accounting, photography"
            className={`${fieldClass} ${fieldBorder(false)}`}
          />
        </FormField>
        <FormField id="vol-availability" label="Availability" required error={errors.availability}>
          <select
            id="vol-availability"
            value={values.availability}
            onChange={(e) => update('availability', e.target.value)}
            aria-invalid={Boolean(errors.availability)}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.availability))}`}
          >
            <option value="">Select availability</option>
            {AVAILABILITY.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id="vol-message" label="Message" hint="Tell us how you would like to help">
        <textarea
          id="vol-message"
          rows={4}
          maxLength={1000}
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
          className={`${fieldClass} ${fieldBorder(false)} resize-y`}
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
          <span>I agree to be contacted by the Foundation about volunteering opportunities.</span>
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
          {submitting ? 'Submitting...' : 'Submit Registration'}
        </Button>
      </div>

      {checked && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-gold-300 bg-gold-50 p-5 text-sm leading-relaxed text-navy-900">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" aria-hidden="true" />
          <p>
            Thank you. Your volunteer registration has been submitted successfully.
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
