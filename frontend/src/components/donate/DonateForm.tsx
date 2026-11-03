
import { useState, type FormEvent } from 'react';
import {
  Info,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Download,
  X,
} from 'lucide-react';
import { jsPDF } from 'jspdf';

import { DONATION_AMOUNTS, FOUNDATION } from '@/data/site';
import FormField, {
  fieldBorder,
  fieldClass,
} from '@/components/forms/FormField';
import {
  isValidEmail,
  isValidPhone,
} from '@/components/forms/validation';
import { Button } from '@/components/common/Button';

interface DonateFormProps {
  compact?: boolean;
}

interface DonateErrors {
  [key: string]: string | undefined;
}

const formatINR = (value: number) =>
  `₹${value.toLocaleString('en-IN')}`;

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export default function DonateForm({
  compact = false,
}: DonateFormProps) {
  const [amount, setAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [donationDate, setDonationDate] = useState(today());
  const [email, setEmail] = useState('');
  const [pan, setPan] = useState('');

  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');

  const [purpose, setPurpose] = useState('');
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<DonateErrors>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  const selectedAmount = customAmount
    ? Number(customAmount)
    : amount;

  const inputClass = (error?: string) =>
    `${fieldClass} ${fieldBorder(Boolean(error))}`;

  const clearError = (field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const selectPreset = (value: number) => {
    setAmount(value);
    setCustomAmount('');
    clearError('amount');
  };

  const handleCustom = (value: string) => {
    setCustomAmount(value.replace(/[^0-9]/g, ''));
    setAmount(null);
    clearError('amount');
  };

  // Validate Donation Form
  const validate = (): DonateErrors => {
    const next: DonateErrors = {};

    if (!selectedAmount || selectedAmount < 100) {
      next.amount = 'Please enter a donation amount of at least ₹100.';
    }

    if (name.trim().length < 2) {
      next.name = 'Please enter your full name.';
    }

    if (!phone.trim() || !isValidPhone(phone)) {
      next.phone = 'Please enter a valid mobile number.';
    }

    if (!donationDate || donationDate > today()) {
      next.donationDate = 'Please select a valid donation date.';
    }

    if (!isValidEmail(email)) {
      next.email = 'Please enter a valid email address.';
    }

    if (
      pan.trim() &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan.trim())
    ) {
      next.pan = 'Please enter a valid PAN number.';
    }

    if (!country) {
      next.country = 'Please select your country.';
    }

    if (!state) {
      next.state = 'Please select your state.';
    }

    if (city.trim().length < 2) {
      next.city = 'Please enter your city.';
    }

    if (landmark.trim().length < 2) {
      next.landmark = 'Please enter your landmark.';
    }

    if (address.trim().length < 5) {
      next.address = 'Please enter your complete address.';
    }

    if (!/^[0-9]{6}$/.test(zip.trim())) {
      next.zip = 'Please enter a valid 6-digit postal code.';
    }

    if (!consent) {
      next.consent = 'Please accept the Terms and Conditions.';
    }

    return next;
  };

  // Generate Donation Acknowledgement PDF
  const downloadDonationSlip = async (id: string) => {
    const pdf = new jsPDF();

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const receiptAmount = selectedAmount || 0;

    // Header
    pdf.setFillColor(11, 31, 58);
    pdf.rect(0, 0, pageWidth, 43, 'F');
    pdf.setFillColor(212, 175, 55);
    pdf.rect(0, 40, pageWidth, 3, 'F');

    let logoData: string | undefined;
    try {
      const response = await fetch(FOUNDATION.logo);
      if (response.ok) {
        const blob = await response.blob();
        logoData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      logoData = undefined;
    }

    if (logoData) {
      pdf.setFillColor(255, 255, 255);
      pdf.circle(30, 21.5, 17, 'F');
      pdf.addImage(logoData, 'PNG', 15, 6.5, 30, 30, undefined, 'FAST');
    }

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    const organisationLines = pdf.splitTextToSize(FOUNDATION.fullName, 125) as string[];
    pdf.text(organisationLines, 51, 12, { lineHeightFactor: 1.1 });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('DONATION ACKNOWLEDGEMENT SLIP', pageWidth / 2, 36, {
      align: 'center',
    });

    // Receipt details
    pdf.setTextColor(11, 31, 58);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);

    pdf.text('DONATION DETAILS', 20, 56);

    pdf.setDrawColor(212, 175, 55);
    pdf.line(20, 61, pageWidth - 20, 61);

    const details: [string, string][] = [
      ['Receipt Number', id],
      ['Donor Name', name],
      ['Mobile Number', phone],
      ['Email Address', email],
      ['Donation Date', donationDate],
      ['PAN Number', pan || 'Not provided'],
      ['Donation Amount', formatINR(receiptAmount)],
      ['Country', country],
      ['State', state],
      ['City', city],
      ['Landmark', landmark],
      ['Address', address],
      ['Postal Code', zip],
      ['Purpose', purpose.trim() || 'General Donation'],
    ];

    let y = 72;

    details.forEach(([label, value]) => {
      const valueLines = pdf.splitTextToSize(value, 110);
      const rowHeight = Math.max(10, valueLines.length * 5);

      if (y + rowHeight > pageHeight - 35) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFillColor(247, 248, 250);
      pdf.roundedRect(20, y - 7, pageWidth - 40, rowHeight + 3, 2, 2, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(11, 31, 58);

      pdf.text(label.toUpperCase(), 24, y);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(70, 70, 70);

      pdf.text(valueLines, 78, y);

      y += rowHeight + 3;
    });

    if (y + 35 > pageHeight - 15) {
      pdf.addPage();
      y = 25;
    }

    // Amount summary
    pdf.setDrawColor(212, 175, 55);
    pdf.line(20, y, pageWidth - 20, y);

    y += 12;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(11, 31, 58);

    pdf.setFillColor(11, 31, 58);
    pdf.roundedRect(20, y - 7, pageWidth - 40, 18, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.text('DONATION AMOUNT', 25, y + 4);
    pdf.text(formatINR(receiptAmount), pageWidth - 25, y + 4, { align: 'right' });

    // Acknowledgement note
    y += 13;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);

    pdf.text(
      'This document is a donation acknowledgement, not a payment receipt.',
      20,
      y
    );

    pdf.text(
      'Payment confirmation and tax eligibility are subject to verification by the Foundation.',
      20,
      y + 7,
    );

    pdf.text(
      `Thank you for supporting ${FOUNDATION.fullName}.`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );

    pdf.save(`${id}.pdf`);
  };

  // Submit Donation Form
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);

    if (hasErrors) {
      const firstError = Object.keys(nextErrors).find(
        (key) => nextErrors[key]
      );

      if (firstError) {
        document.getElementById(`donor-${firstError}`)?.focus();
      }

      return;
    }

    // Generate unique acknowledgement number
    const id = `ASKMM-${Date.now()}`;

    setReceiptNumber(id);

    // Download PDF
    void downloadDonationSlip(id);

    // Show Thank You Popup
    setShowThankYou(true);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-7"
        aria-labelledby="donate-form-title"
      >
        {/* Donation Amount */}
        <section className="flex flex-col gap-4">
          <div>
            <h2
              id="donate-form-title"
              className={
                compact
                  ? 'text-xl font-bold text-navy-900'
                  : 'text-2xl font-bold text-navy-900'
              }
            >
              Donation Details
            </h2>

            <p className="mt-1 text-sm text-muted">
              Choose an amount to support our foundation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DONATION_AMOUNTS.map((value) => {
              const active = amount === value && !customAmount;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectPreset(value)}
                  className={`rounded-xl border-2 px-3 py-3 text-base font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                    active
                      ? 'border-gold-500 bg-gold-50 text-navy-900 shadow-card'
                      : 'border-navy-100 bg-white text-navy-900 hover:border-gold-400'
                  }`}
                >
                  {formatINR(value)}
                </button>
              );
            })}
          </div>

          <FormField
            id="custom-amount"
            label="Custom Donation Amount (INR)"
            error={errors.amount}
            hint="Minimum donation amount ₹100"
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted">
                ₹
              </span>

              <input
                id="custom-amount"
                inputMode="numeric"
                value={customAmount}
                onChange={(event) => handleCustom(event.target.value)}
                placeholder="Enter Amount"
                aria-invalid={Boolean(errors.amount)}
                className={`${inputClass(errors.amount)} pl-9`}
              />
            </div>
          </FormField>
        </section>

        {/* Personal Information */}
        <section className="space-y-4">
          <h3 className="border-b border-navy-100 pb-2 text-lg font-bold text-navy-900">
            Personal Information
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="donor-name"
              label="Name"
              required
              error={errors.name}
            >
              <input
                id="donor-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                }}
                placeholder="Enter Name"
                aria-invalid={Boolean(errors.name)}
                className={inputClass(errors.name)}
              />
            </FormField>

            <FormField
              id="donor-phone"
              label="Mobile"
              required
              error={errors.phone}
            >
              <input
                id="donor-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearError('phone');
                }}
                placeholder="Enter Mobile"
                aria-invalid={Boolean(errors.phone)}
                className={inputClass(errors.phone)}
              />
            </FormField>

            <FormField
              id="donor-donationDate"
              label="Donation Date"
              required
              error={errors.donationDate}
            >
              <input
                id="donor-donationDate"
                type="date"
                max={today()}
                value={donationDate}
                onChange={(e) => {
                  setDonationDate(e.target.value);
                  clearError('donationDate');
                }}
                className={inputClass(errors.donationDate)}
              />
            </FormField>

            <FormField
              id="donor-email"
              label="Email"
              required
              error={errors.email}
            >
              <input
                id="donor-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                placeholder="Enter Email"
                aria-invalid={Boolean(errors.email)}
                className={inputClass(errors.email)}
              />
            </FormField>

            <FormField
              id="donor-pan"
              label="PAN Number"
              error={errors.pan}
              hint="Optional"
            >
              <input
                id="donor-pan"
                type="text"
                maxLength={10}
                value={pan}
                onChange={(e) => {
                  setPan(e.target.value.toUpperCase());
                  clearError('pan');
                }}
                placeholder="Enter PAN Number"
                className={inputClass(errors.pan)}
              />
            </FormField>
          </div>
        </section>

        {/* Address Information */}
        <section className="space-y-4">
          <h3 className="border-b border-navy-100 pb-2 text-lg font-bold text-navy-900">
            Address Information
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="donor-country"
              label="Select Country"
              required
              error={errors.country}
            >
              <select
                id="donor-country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  clearError('country');
                }}
                className={inputClass(errors.country)}
              >
                <option value="India">India</option>
              </select>
            </FormField>

            <FormField
              id="donor-state"
              label="Select State"
              required
              error={errors.state}
            >
              <select
                id="donor-state"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  clearError('state');
                }}
                className={inputClass(errors.state)}
              >
                <option value="">Select State</option>

                {indianStates.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="donor-city"
              label="Select City"
              required
              error={errors.city}
            >
              <input
                id="donor-city"
                type="text"
                list="donation-cities"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  clearError('city');
                }}
                placeholder="Select City"
                className={inputClass(errors.city)}
              />

              <datalist id="donation-cities">
                <option value="Bhubaneswar" />
                <option value="Cuttack" />
                <option value="Puri" />
                <option value="Rourkela" />
                <option value="Sambalpur" />
                <option value="Kolkata" />
                <option value="Delhi" />
                <option value="Mumbai" />
                <option value="Bengaluru" />
                <option value="Hyderabad" />
                <option value="Chennai" />
              </datalist>
            </FormField>

            <FormField
              id="donor-landmark"
              label="Landmark"
              required
              error={errors.landmark}
            >
              <input
                id="donor-landmark"
                type="text"
                value={landmark}
                onChange={(e) => {
                  setLandmark(e.target.value);
                  clearError('landmark');
                }}
                placeholder="Enter Your Landmark"
                className={inputClass(errors.landmark)}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField
                id="donor-address"
                label="Address"
                required
                error={errors.address}
              >
                <textarea
                  id="donor-address"
                  rows={3}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearError('address');
                  }}
                  placeholder="Enter Your Address"
                  className={`${inputClass(errors.address)} resize-none`}
                />
              </FormField>
            </div>

            <FormField
              id="donor-zip"
              label="Zip / Postal Code"
              required
              error={errors.zip}
            >
              <input
                id="donor-zip"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={zip}
                onChange={(e) => {
                  setZip(e.target.value.replace(/\D/g, ''));
                  clearError('zip');
                }}
                placeholder="Enter Zip/Postal Code"
                className={inputClass(errors.zip)}
              />
            </FormField>
          </div>
        </section>

        {/* Purpose of Donation */}
        <section className="space-y-4">
          <h3 className="border-b border-navy-100 pb-2 text-lg font-bold text-navy-900">
            Purpose of Donation
          </h3>

          <FormField
            id="donor-purpose"
            label="Purpose of Donation"
          >
            <textarea
              id="donor-purpose"
              rows={3}
              maxLength={500}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Enter purpose of donation (optional)"
              className={`${inputClass()} resize-none`}
            />
          </FormField>
        </section>

        {/* Terms and Conditions */}
        <section className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                clearError('consent');
              }}
              aria-invalid={Boolean(errors.consent)}
              className="mt-1 h-5 w-5 flex-shrink-0 rounded border-navy-200 text-navy-900 focus:ring-gold-400"
            />

            <span>
              I have read the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-navy-800 underline decoration-gold-500 underline-offset-4 hover:text-gold-600"
              >
                Terms and Conditions
              </a>{' '}
              and hereby agree to the same.
            </span>
          </label>

          {errors.consent && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {errors.consent}
            </p>
          )}
        </section>

        {/* Donation Note */}
        <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-600" />

            <div>
              <p className="text-sm font-bold text-navy-900">
                Note:
              </p>

              <p className="mt-1 text-sm leading-relaxed text-navy-800">
                To receive a donation slip, please follow the donation
                process. Payment receipts eligible for tax-deductible
                contributions require valid contact information.
              </p>
            </div>
          </div>
        </div>

        {/* Donation Summary */}
        <div className="rounded-2xl bg-mist p-5 sm:p-6">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Donation Amount</span>

            <span className="font-semibold text-ink">
              {selectedAmount ? formatINR(selectedAmount) : 'Not selected'}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-navy-100 pt-3">
            <span className="font-semibold text-navy-900">
              Total Payable
            </span>

            <span className="text-2xl font-bold text-navy-900">
              {selectedAmount ? formatINR(selectedAmount) : '-'}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
          >
            <IndianRupee className="h-5 w-5" aria-hidden="true" />
            Submit Donation Details
          </Button>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green" />

            Payment gateway integration is pending. No payment
            will be collected until a payment provider is connected.
          </p>
        </div>
      </form>

      {/* Thank You Popup */}
      {showThankYou && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/75 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-success-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-7 text-center shadow-2xl animate-[fadeInUp_0.3s_ease-out] sm:p-9"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowThankYou(false)}
              aria-label="Close thank you popup"
              className="absolute right-4 top-4 rounded-full bg-navy-50 p-2 text-navy-800 transition hover:bg-navy-100"
            >
              <X size={19} />
            </button>

            {/* Success Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2
                size={45}
                className="text-green-600"
              />
            </div>

            {/* Heading */}
            <h2
              id="donation-success-title"
              className="mt-6 text-2xl font-bold text-navy-900"
            >
              Thank You!
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-muted">
              Thank you for your generosity and support.
              Your contribution can help us create a better
              future for our community.
            </p>

            {/* Receipt Details */}
            <div className="mt-6 rounded-2xl bg-mist p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Donation Acknowledgement
              </p>

              <div className="mt-3 flex justify-between gap-3 text-sm">
                <span className="text-muted">Receipt Number</span>

                <span className="break-all text-right font-semibold text-navy-900">
                  {receiptNumber}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-3 border-t border-navy-100 pt-3 text-sm">
                <span className="text-muted">Donor Name</span>

                <span className="font-semibold text-navy-900">
                  {name}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-3 border-t border-navy-100 pt-3">
                <span className="text-sm text-muted">
                  Donation Amount
                </span>

                <span className="text-lg font-bold text-navy-900">
                  {formatINR(selectedAmount || 0)}
                </span>
              </div>
            </div>

            {/* Download Receipt */}
            <button
              type="button"
              onClick={() => void downloadDonationSlip(receiptNumber)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-4 font-semibold text-white transition hover:bg-navy-800"
            >
              <Download size={19} />
              Download Donation Slip
            </button>

            <button
              type="button"
              onClick={() => setShowThankYou(false)}
              className="mt-3 w-full rounded-xl border border-navy-200 px-5 py-3 font-semibold text-navy-900 transition hover:bg-navy-50"
            >
              Close
            </button>

            <p className="mt-5 text-xs text-muted">
              With gratitude, ASKMM Foundation
            </p>

            <p className="mt-2 text-[10px] leading-relaxed text-muted">
              This is a donation acknowledgement, not confirmation
              of payment or eligibility for tax benefits.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
