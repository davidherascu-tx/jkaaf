'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import SignaturePad, { type SignatureValue } from '@/components/SignaturePad';

const MEMBER_ORGS = ['JKAAF', 'JKAWF Americas', 'SKDI', 'Other/Independent'] as const;
type MemberOrg = (typeof MEMBER_ORGS)[number];

const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'] as const;
type Gender = (typeof GENDERS)[number];

const HEALTH_CONDITIONS = [
  'Heart murmur',
  'Hypertension',
  'Recent infection',
  'Bone fracture in the past six months',
  'Concussion/severe head injury in the past six months',
  'Seizures',
  'Eye injury',
  'Severe bone bruises or condition requiring padding',
  'Kidney injury',
  'Allergy to medication (list below)',
  'Currently taking medications (list below)',
] as const;
const NONE_OPTION = 'None of the above';

interface PricedOption {
  id: string;
  label: string;
  price: number;
  feeNote: string;
}

const CAMP_TIERS: PricedOption[] = [
  { id: 'teens-adults', label: 'Teens and Adults', price: 412, feeNote: '$400 + $12.00 processing fee' },
  { id: 'kids', label: 'Kids under 12', price: 231.75, feeNote: '$225 + $6.75 processing fee' },
  { id: 'collegiate', label: 'Collegiate', price: 231.75, feeNote: '$225 + $6.75 processing fee' },
];

const DAN_EXAMS: PricedOption[] = [
  { id: 'dan-1', label: '1st Dan', price: 262.65, feeNote: '$255 + $7.65 processing fee' },
  { id: 'dan-2', label: '2nd Dan', price: 324.45, feeNote: '$315 + $9.45 processing fee' },
  { id: 'dan-3', label: '3rd Dan', price: 406.85, feeNote: '$395 + $11.85 processing fee' },
  { id: 'dan-4', label: '4th Dan', price: 489.25, feeNote: '$475 + $14.25 processing fee' },
  { id: 'dan-5', label: '5th Dan', price: 860.05, feeNote: '$835 + $25.05 processing fee' },
];

interface QualExam {
  id: string;
  label: string;
  price: number;
  feeNote: string;
  levels: string[];
}
const QUAL_EXAMS: QualExam[] = [
  { id: 'instructor', label: 'Instructor', price: 216.30, feeNote: '$210 + $6.30 processing fee', levels: ['D', 'C', 'B', 'A'] },
  { id: 'examiner', label: 'Examiner', price: 267.80, feeNote: '$260 + $7.80 processing fee', levels: ['D', 'C'] },
  { id: 'judge', label: 'Judge', price: 206.0, feeNote: '$200 + $6.00 processing fee', levels: ['D', 'C', 'B', 'A'] },
];

const COUPON_CODE = '2026MEMBER';
const COUPON_DISCOUNT = 25;

const WAIVER_TEXT = `"Event": the JKAAF National Karate Camp 2026. I understand that there are risks and dangers inherent in martial arts training and in participating in and/or receiving instruction at the EVENT. I understand and agree that by signing this Waiver/Release, I am assuming full responsibility for any and all risk of personal injury or death or for property damage suffered by me while participating in and/or receiving instruction at the EVENT. I expressly acknowledge that my participation in the EVENT June 11-14, 2026 may subject me to personal injury or bodily harm and I assume any and all risks of that participation, including the risk of contracting communicable diseases such as Covid-19. I also understand that in order to be allowed to participate in and/or receive instruction at the EVENT, I must give up my rights to hold the JKA American Federation and its affiliates, Louisiana Karate Association, Xavier University, and any and all other facilities used for training or gathering, and any and all other clubs, schools, instructors, members, judges, officials, representatives and all other participants (collectively the "Releasees") liable for any injury or damage which I may suffer while participating in and/or receiving instruction at the EVENT.

I also understand and agree that by signing the Waiver/Release, I acknowledge that I am solely responsible for having or obtaining all insurance coverage which may be necessary or desirable in connection with my participation in and/or receipt of instruction at the EVENT and for any travel to and from the EVENT and in all lodging or any other activities which may be related directly, indirectly or incidentally to the foregoing. I further understand and agree that any fees or costs required for necessary or requested medical attention shall be my sole responsibility and that I shall not seek indemnification or contribution from any Releasee in connection therewith. I also understand that the Releasees shall not be responsible for any incidental, consequential or exemplary damages of any kind even if they are notified of the possibility of such in advance. I also understand and agree that any damage to any lodging sites or the tournament site that I cause is my full responsibility. In no case are said damages the responsibility of any of the Releasees.

I understand and agree that this Waiver/Release will have the effect of releasing, discharging, waiving and forever relinquishing any and all actions or causes of action that I have or have had, whether past, present or future, whether known or unknown, and whether anticipated or unanticipated by me, arising out of my participation in and/or receipt of instruction at the EVENT. Knowing this, and in consideration of being permitted to participate in and/or receive instruction at the EVENT, I hereby release and agree to indemnify and hold harmless the above-named Releasees individually and their entities, and their officers, agents, principals, partners, shareholders, directors and employees from any and all liability or costs, including attorney fees, associated with or arising from my participation in and/or receipt of instruction at the EVENT. I further understand and agree that this Waiver/Release will be binding on me, my spouse, my heirs, my personal representative, my assigns, my children, and any guardian ad litem for said children.

I understand and agree that the Releasees shall have the right to use my name, image or likeness in the promotion of the Event or in any publication relating to the Event (or similar Events) and in any broadcast or rebroadcast transmission of the Event, without any additional consideration or notice to me for the use of my name, image, audio/sound or likeness for lawful use in publications (such as brochures, newsletters, websites, magazines or other electronic form of media). "Name, image, audio/sound or likeness" includes any type of recording, including but not limited to photographs, digital images, drawings, renderings, voices, sounds, video recordings, audio clips or accompanying written descriptions.

I understand that if I am signing this Waiver/Release on behalf of my minor child, that I will be giving up the same rights for said minor as I would be giving up if I signed this document on my own behalf. I acknowledge that I have read this Waiver/Release Agreement and that I understand the words and language in it.`;

const formatPrice = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-bold text-gray-800 mb-1.5">
      {children}
      {required && <span className="text-red-600 ml-0.5">*</span>}
    </label>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
        {title}
      </h2>
      {subtitle && <p className="text-gray-600 mt-2 text-sm">{subtitle}</p>}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors';

export default function RegisterPage() {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [memberOrg, setMemberOrg] = useState<MemberOrg | ''>('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rank, setRank] = useState('');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [allergiesMeds, setAllergiesMeds] = useState('');
  const [campTier, setCampTier] = useState<string>('');
  const [danExam, setDanExam] = useState<string>('');
  const [qualExam, setQualExam] = useState<string>('');
  const [qualLevel, setQualLevel] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [signature, setSignature] = useState<SignatureValue>({ mode: 'draw', data: null });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const couponValid = couponCode.trim().toUpperCase() === COUPON_CODE;

  const totals = useMemo(() => {
    const campPrice = CAMP_TIERS.find((t) => t.id === campTier)?.price ?? 0;
    const danPrice = DAN_EXAMS.find((d) => d.id === danExam)?.price ?? 0;
    const qualPrice = QUAL_EXAMS.find((q) => q.id === qualExam)?.price ?? 0;
    const subtotal = campPrice + danPrice + qualPrice;
    const discount = couponValid ? Math.min(COUPON_DISCOUNT, subtotal) : 0;
    return { campPrice, danPrice, qualPrice, subtotal, discount, total: subtotal - discount };
  }, [campTier, danExam, qualExam, couponValid]);

  const toggleHealthCondition = (condition: string) => {
    setHealthConditions((prev) => {
      if (condition === NONE_OPTION) {
        return prev.includes(NONE_OPTION) ? [] : [NONE_OPTION];
      }
      const without = prev.filter((c) => c !== NONE_OPTION);
      if (without.includes(condition)) {
        return without.filter((c) => c !== condition);
      }
      return [...without, condition];
    });
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    if (!lastName.trim()) e.lastName = 'Last name is required.';
    if (!memberOrg) e.memberOrg = 'Select a member organization.';
    if (!age.trim()) e.age = 'Age is required.';
    else if (Number.isNaN(Number(age)) || Number(age) <= 0) e.age = 'Enter a valid age.';
    if (!gender) e.gender = 'Select a gender.';
    if (!address.trim()) e.address = 'Address is required.';
    if (!phone.trim()) e.phone = 'Phone number is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!rank.trim()) e.rank = 'Rank is required.';
    if (healthConditions.length === 0) e.healthConditions = 'Select at least one option (or "None of the above").';
    if (!campTier) e.campTier = 'Select a camp registration option.';
    if (qualExam && !qualLevel) e.qualLevel = 'Select an exam level.';
    if (!waiverAccepted) e.waiverAccepted = 'You must accept the waiver to register.';
    const sigHasData =
      (signature.mode === 'draw' && !!signature.data) ||
      (signature.mode === 'type' && !!signature.data && signature.data.trim().length > 1) ||
      (signature.mode === 'upload' && !!signature.data);
    if (!sigHasData) e.signature = 'Signature is required.';
    return e;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      // Scroll to the first error
      const firstKey = Object.keys(next)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const payload = {
      participant: { firstName, lastName, guardianName, memberOrg, age: Number(age), gender, address, phone, email, rank },
      healthConditions,
      allergiesMeds,
      camp: CAMP_TIERS.find((t) => t.id === campTier),
      danExam: DAN_EXAMS.find((d) => d.id === danExam) ?? null,
      qualExam: qualExam ? { ...QUAL_EXAMS.find((q) => q.id === qualExam)!, selectedLevel: qualLevel } : null,
      coupon: couponValid ? COUPON_CODE : null,
      totals,
      waiverAccepted,
      signature,
      submittedAt: new Date().toISOString(),
    };

    // TODO: wire up real submission (POST to /api/register, email service, etc.)
    // For now we just log to the console and show a success page.
    console.log('[Summer Camp Registration]', payload);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div className="bg-gray-50 min-h-screen pt-28 md:pt-40 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-10">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Registration received</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Thank you, <strong className="text-gray-900">{firstName} {lastName}</strong>. We&apos;ve recorded your registration for the 2026 JKA/AF National Karate Camp. A confirmation will be sent to <strong className="text-gray-900">{email}</strong>.
              {(danExam || qualExam) && (
                <>
                  <br />
                  <br />
                  <span className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg px-4 py-3 text-sm">
                    <strong>Reminder:</strong> You registered for an exam. You must also email your typed registration forms to <a className="underline font-bold" href="mailto:jkaafusa@gmail.com">jkaafusa@gmail.com</a> by May 31, 2026.
                  </span>
                </>
              )}
            </p>
            <div className="text-2xl font-extrabold text-gray-900 mb-1">{formatPrice(totals.total)}</div>
            <div className="text-sm text-gray-500 mb-8">Total amount</div>
            <Link
              href="/events"
              className="inline-block px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
            >
              Back to events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-40 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold text-sm mb-8 transition-colors group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">&larr;</span>
          Back to events
        </Link>

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-widest rounded-lg border border-red-200 mb-4">
            Register
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            2026 JKA/AF National Karate Camp
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Register here for the 2026 JKA/AF National Karate Camp in <strong>New Orleans, Louisiana</strong>, from <strong>June 11–14, 2026</strong>.
          </p>
          <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm leading-relaxed">
            If you register for a Dan or qualification test here, you must also send your registration forms to{' '}
            <a href="mailto:jkaafusa@gmail.com" className="font-bold underline">jkaafusa@gmail.com</a>.
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-12">

          {/* Participant Information */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <SectionHeader title="Participant Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div id="field-firstName">
                <FieldLabel required>Participant first name</FieldLabel>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                {errors.firstName && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.firstName}</p>}
              </div>
              <div id="field-lastName">
                <FieldLabel required>Participant last name</FieldLabel>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                {errors.lastName && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.lastName}</p>}
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>If participant is a minor, list a parent/legal guardian name</FieldLabel>
                <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className={inputClass} />
                <p className="text-xs text-gray-500 mt-1.5">
                  We will also need the Minor Consent for Emergency Treatment form linked at{' '}
                  <a href="https://jkaaf.com/summercamp" target="_blank" rel="noopener noreferrer" className="text-red-600 font-semibold underline">jkaaf.com/summercamp</a>.
                </p>
              </div>

              <div id="field-memberOrg" className="sm:col-span-2">
                <FieldLabel required>Member organization</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {MEMBER_ORGS.map((org) => (
                    <label key={org} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-colors ${memberOrg === org ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="memberOrg"
                        value={org}
                        checked={memberOrg === org}
                        onChange={() => setMemberOrg(org)}
                        className="w-4 h-4 accent-red-600"
                      />
                      <span className="text-sm font-semibold text-gray-800">{org}</span>
                    </label>
                  ))}
                </div>
                {errors.memberOrg && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.memberOrg}</p>}
              </div>

              <div id="field-age">
                <FieldLabel required>Participant age</FieldLabel>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={inputClass}
                />
                {errors.age && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.age}</p>}
              </div>
              <div id="field-gender">
                <FieldLabel required>Participant gender</FieldLabel>
                <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputClass}>
                  <option value="">Select…</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.gender && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.gender}</p>}
              </div>

              <div id="field-address" className="sm:col-span-2">
                <FieldLabel required>Address</FieldLabel>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="Street, City, State, ZIP" />
                {errors.address && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.address}</p>}
              </div>

              <div id="field-phone">
                <FieldLabel required>Phone number</FieldLabel>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                {errors.phone && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.phone}</p>}
              </div>
              <div id="field-email">
                <FieldLabel required>Email</FieldLabel>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                {errors.email && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.email}</p>}
              </div>

              <div id="field-rank" className="sm:col-span-2">
                <FieldLabel required>Participant rank (kyu / Dan)</FieldLabel>
                <input value={rank} onChange={(e) => setRank(e.target.value)} className={inputClass} placeholder="e.g. 1st kyu, 2nd Dan" />
                {errors.rank && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.rank}</p>}
              </div>
            </div>
          </section>

          {/* Health */}
          <section id="field-healthConditions" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <SectionHeader title="Health History" subtitle="Do you have a history of any of the following conditions? *" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEALTH_CONDITIONS.map((cond) => (
                <label key={cond} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${healthConditions.includes(cond) ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={healthConditions.includes(cond)}
                    onChange={() => toggleHealthCondition(cond)}
                    className="mt-0.5 w-4 h-4 accent-red-600"
                  />
                  <span className="text-sm text-gray-800 leading-snug">{cond}</span>
                </label>
              ))}
              <label className={`sm:col-span-2 flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${healthConditions.includes(NONE_OPTION) ? 'border-gray-700 bg-gray-100' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <input
                  type="checkbox"
                  checked={healthConditions.includes(NONE_OPTION)}
                  onChange={() => toggleHealthCondition(NONE_OPTION)}
                  className="mt-0.5 w-4 h-4 accent-gray-700"
                />
                <span className="text-sm font-bold text-gray-800 leading-snug">{NONE_OPTION}</span>
              </label>
            </div>
            {errors.healthConditions && <p className="mt-2 text-xs text-red-600 font-semibold">{errors.healthConditions}</p>}

            <div className="mt-5">
              <FieldLabel>List allergies to medications and medications you are currently taking</FieldLabel>
              <textarea
                value={allergiesMeds}
                onChange={(e) => setAllergiesMeds(e.target.value)}
                rows={3}
                className={inputClass + ' resize-y'}
                placeholder="Leave blank if not applicable"
              />
            </div>
          </section>

          {/* Camp Registration */}
          <section id="field-campTier" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <SectionHeader
              title="Camp Registration"
              subtitle={`Don't forget your JKAAF coupon code at checkout for $25 off — ${COUPON_CODE}. Prices below include the 3% online processing fee. To save on this fee, select "offline payment" at checkout and pay by cash, check, or Zelle.`}
            />
            <div className="space-y-2">
              {CAMP_TIERS.map((tier) => (
                <label key={tier.id} className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-colors ${campTier === tier.id ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="campTier"
                      checked={campTier === tier.id}
                      onChange={() => setCampTier(tier.id)}
                      className="w-4 h-4 accent-red-600"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{tier.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{tier.feeNote}</p>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-gray-900 whitespace-nowrap">{formatPrice(tier.price)}</span>
                </label>
              ))}
            </div>
            {errors.campTier && <p className="mt-2 text-xs text-red-600 font-semibold">{errors.campTier}</p>}
          </section>

          {/* Dan Exams */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <SectionHeader
              title="Dan Exams (optional)"
              subtitle="Note: you must attend the full camp to test, and you must email your registration forms before the deadline (May 31, 2026)."
            />
            <div className="space-y-2">
              <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${danExam === '' ? 'border-gray-700 bg-gray-100' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="danExam"
                  checked={danExam === ''}
                  onChange={() => setDanExam('')}
                  className="w-4 h-4 accent-gray-700"
                />
                <span className="text-sm font-bold text-gray-700">No Dan exam</span>
              </label>
              {DAN_EXAMS.map((exam) => (
                <label key={exam.id} className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-colors ${danExam === exam.id ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="danExam"
                      checked={danExam === exam.id}
                      onChange={() => setDanExam(exam.id)}
                      className="w-4 h-4 accent-red-600"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{exam.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{exam.feeNote}</p>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-gray-900 whitespace-nowrap">{formatPrice(exam.price)}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Qualification Exams */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <SectionHeader title="Qualification Exams (optional)" />
            <div className="space-y-2">
              <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${qualExam === '' ? 'border-gray-700 bg-gray-100' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="qualExam"
                  checked={qualExam === ''}
                  onChange={() => { setQualExam(''); setQualLevel(''); }}
                  className="w-4 h-4 accent-gray-700"
                />
                <span className="text-sm font-bold text-gray-700">No qualification exam</span>
              </label>
              {QUAL_EXAMS.map((exam) => (
                <div key={exam.id}>
                  <label className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-colors ${qualExam === exam.id ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="qualExam"
                        checked={qualExam === exam.id}
                        onChange={() => { setQualExam(exam.id); setQualLevel(''); }}
                        className="w-4 h-4 accent-red-600"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{exam.label} ({exam.levels.join(', ')})</p>
                        <p className="text-xs text-gray-500 mt-0.5">{exam.feeNote}</p>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-gray-900 whitespace-nowrap">{formatPrice(exam.price)}</span>
                  </label>
                  {qualExam === exam.id && (
                    <div id="field-qualLevel" className="mt-2 ml-7">
                      <FieldLabel required>Select exam level</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {exam.levels.map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setQualLevel(lvl)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${qualLevel === lvl ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:border-red-300'}`}
                          >
                            Level {lvl}
                          </button>
                        ))}
                      </div>
                      {errors.qualLevel && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.qualLevel}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Coupon + Totals */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <SectionHeader title="Summary" />
            <div className="mb-5">
              <FieldLabel>Coupon code (optional)</FieldLabel>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className={inputClass + ' uppercase'}
                  placeholder="e.g. 2026MEMBER"
                />
              </div>
              {couponCode.length > 0 && (
                <p className={`mt-1.5 text-xs font-semibold ${couponValid ? 'text-green-700' : 'text-gray-500'}`}>
                  {couponValid ? `✓ Code applied — ${formatPrice(COUPON_DISCOUNT)} off` : 'Enter a valid JKAAF member code to receive your discount.'}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-2 text-sm">
              <Row label="Camp" value={totals.campPrice ? formatPrice(totals.campPrice) : '—'} />
              <Row label="Dan exam" value={totals.danPrice ? formatPrice(totals.danPrice) : '—'} />
              <Row label="Qualification exam" value={totals.qualPrice ? formatPrice(totals.qualPrice) : '—'} />
              {totals.discount > 0 && <Row label="Member discount" value={`− ${formatPrice(totals.discount)}`} positive />}
              <div className="border-t border-gray-200 pt-3 mt-3 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-2xl font-extrabold text-gray-900">{formatPrice(totals.total)}</span>
              </div>
            </div>
          </section>

          {/* Waiver */}
          <section id="field-waiverAccepted" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <SectionHeader title="Participant Waiver and Release" />
            <div className="max-h-72 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {WAIVER_TEXT}
            </div>
            <label className={`mt-5 flex items-start gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${waiverAccepted ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
              <input
                type="checkbox"
                checked={waiverAccepted}
                onChange={(e) => setWaiverAccepted(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-red-600"
              />
              <span className="text-sm font-bold text-gray-900 leading-snug">
                I have read and agree to the Participant Waiver and Release.
              </span>
            </label>
            {errors.waiverAccepted && <p className="mt-2 text-xs text-red-600 font-semibold">{errors.waiverAccepted}</p>}
          </section>

          {/* Signature */}
          <section id="field-signature" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <SectionHeader title="Signature" subtitle="Required. Draw, type, or upload your signature." />
            <SignaturePad value={signature} onChange={setSignature} />
            {errors.signature && <p className="mt-2 text-xs text-red-600 font-semibold">{errors.signature}</p>}
          </section>

          {/* Submit */}
          <div className="sticky bottom-4 z-10">
            <div className="bg-gray-900 rounded-2xl p-5 shadow-2xl flex items-center justify-between gap-4 flex-wrap">
              <div className="text-white">
                <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">Total</div>
                <div className="text-2xl font-extrabold">{formatPrice(totals.total)}</div>
              </div>
              <button
                type="submit"
                className="flex-grow sm:flex-grow-0 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Registration
              </button>
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="mt-3 text-center text-sm font-semibold text-red-600">
                Please correct the highlighted fields above.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${positive ? 'text-green-700' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}
