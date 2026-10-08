'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import SignaturePad, { type SignatureValue } from '@/components/SignaturePad';
import { submitApplicationAction } from '@/app/membership/application/actions';
import {
  AGREEMENT_CLAUSES,
  AGREEMENT_INTRO,
  CERTIFY_CLAUSES,
  CERTIFY_INTRO,
  DOJO_SECTIONS,
  FINAL_FIELDS,
  isVisible,
  validateApplication,
  type Clause,
  type Errors,
  type FormField,
  type Values,
} from '@/lib/dojoForm';
import { Card, ErrorBox, Field, inputClass, primaryBtn } from '@/components/shop/ui';

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_ACCOUNT = { first_name: '', last_name: '', email: '', password: '', confirm: '' };

export default function DojoApplicationForm({ signedInAs }: { signedInAs: string | null }) {
  const [values, setValues] = useState<Values>({ sign_date: today() });
  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [signature, setSignature] = useState<SignatureValue>({ mode: 'draw', data: null });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [pending, startTransition] = useTransition();

  const set = (name: string, v: string) => setValues((p) => ({ ...p, [name]: v }));

  function signatureString(): string {
    if (!signature.data) return '';
    if (signature.mode === 'type') return signature.data.trim().length > 1 ? `typed:${signature.data.trim()}` : '';
    return signature.data;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const sig = signatureString();
    const errs = validateApplication(values, sig);
    if (!signedInAs) {
      if (!account.first_name.trim()) errs.acc_first_name = 'Required';
      if (!account.last_name.trim()) errs.acc_last_name = 'Required';
      if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(account.email.trim())) errs.acc_email = 'Enter a valid email';
      if (account.password.length < 8) errs.acc_password = 'At least 8 characters';
      if (account.password !== account.confirm) errs.acc_confirm = 'Passwords do not match';
    }
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    startTransition(async () => {
      const res = await submitApplicationAction(values, sig, signedInAs ? null : account);
      if (res?.error) setServerError(res.error);
    });
  }

  const renderField = (f: FormField) => {
    if (!isVisible(f, values)) return null;
    const err = errors[f.name];
    const common = {
      id: `field-${f.name}`,
      name: f.name,
      value: values[f.name] ?? '',
      className: `${inputClass} ${err ? '!border-red-500' : ''}`,
    };
    let control;
    if (f.type === 'textarea') {
      control = <textarea {...common} rows={3} onChange={(e) => set(f.name, e.target.value)} />;
    } else if (f.type === 'select') {
      control = (
        <select {...common} onChange={(e) => set(f.name, e.target.value)}>
          <option value="">Select…</option>
          {f.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    } else if (f.type === 'choice') {
      control = (
        <div id={common.id} className="flex flex-wrap gap-5">
          {f.options?.map((o) => (
            <label key={o} className="flex items-center gap-2 text-gray-800">
              <input
                type="radio"
                name={f.name}
                checked={values[f.name] === o}
                onChange={() => set(f.name, o)}
                className="h-4 w-4 accent-red-600"
              />
              {o}
            </label>
          ))}
        </div>
      );
    } else {
      control = (
        <input
          {...common}
          type={f.type}
          min={f.type === 'number' ? 0 : undefined}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );
    }
    return (
      <Field key={f.name} label={f.label} required={f.required} hint={f.hint}>
        {control}
        {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
      </Field>
    );
  };

  const renderClause = (c: Clause) => (
    <div key={c.name} id={`field-${c.name}`} className="space-y-2">
      <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <input
          type="checkbox"
          checked={values[c.name] === 'yes'}
          onChange={(e) => set(c.name, e.target.checked ? 'yes' : '')}
          className="h-4 w-4 accent-red-600"
        />
        I have read and agree <span className="text-red-600">*</span>
      </label>
      {errors[c.name] && <p className="text-xs text-red-600">{errors[c.name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {signedInAs ? (
        <p className="text-sm text-gray-700">
          Submitting as <strong>{signedInAs}</strong>.
        </p>
      ) : (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-600 rounded-full" />
              Create your account
            </h2>
            <p className="text-sm text-gray-600">
              Already have one?{' '}
              <Link href="/account/login?next=/membership/application" className="font-semibold text-red-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-5">
            Your account lets you follow this application and order from the shop once it is approved.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {(
              [
                ['first_name', 'First name', 'text'],
                ['last_name', 'Last name', 'text'],
                ['email', 'Account email', 'email'],
                ['password', 'Password', 'password'],
                ['confirm', 'Confirm password', 'password'],
              ] as const
            ).map(([k, label, type]) => (
              <Field key={k} label={label} required>
                <input
                  id={`field-acc_${k}`}
                  type={type}
                  value={account[k]}
                  autoComplete={type === 'password' ? 'new-password' : k === 'email' ? 'email' : undefined}
                  onChange={(e) => setAccount((p) => ({ ...p, [k]: e.target.value }))}
                  className={`${inputClass} ${errors[`acc_${k}`] ? '!border-red-500' : ''}`}
                />
                {errors[`acc_${k}`] && <p className="text-xs text-red-600 mt-1">{errors[`acc_${k}`]}</p>}
              </Field>
            ))}
          </div>
        </Card>
      )}
      {DOJO_SECTIONS.map((s) => (
        <Card key={s.title}>
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-600 rounded-full" />
            {s.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {s.fields.map((f) => {
              const el = renderField(f);
              return el && (f.type === 'textarea' ? <div key={f.name} className="sm:col-span-2">{el}</div> : el);
            })}
          </div>
        </Card>
      ))}

      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-600 rounded-full" />
          Agreement
        </h2>
        <div className="space-y-5">
          <p className="text-sm text-gray-700 leading-relaxed">{AGREEMENT_INTRO}</p>
          {AGREEMENT_CLAUSES.map(renderClause)}
          <p className="text-sm text-gray-700 leading-relaxed pt-2">{CERTIFY_INTRO}</p>
          {CERTIFY_CLAUSES.map(renderClause)}
          <div className="grid gap-5 pt-2">{FINAL_FIELDS.slice(0, 2).map(renderField)}</div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-600 rounded-full" />
          Signature
        </h2>
        <div className="space-y-5">
          <div id="field-signature">
            <p className="text-sm font-bold text-gray-800 mb-2">
              Dojo Chief Instructor&apos;s eSignature <span className="text-red-600">*</span>
            </p>
            <SignaturePad value={signature} onChange={setSignature} />
            {errors.signature && <p className="text-xs text-red-600 mt-1">{errors.signature}</p>}
          </div>
          <div className="max-w-xs">{renderField(FINAL_FIELDS[2])}</div>
        </div>
      </Card>

      <p className="text-sm text-gray-600">Application does not guarantee admission.</p>
      {serverError && <ErrorBox>{serverError}</ErrorBox>}
      {Object.keys(errors).length > 0 && <ErrorBox>Please fix the highlighted fields above.</ErrorBox>}
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  );
}
