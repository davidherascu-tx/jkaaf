'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction, registerAction, type FormState } from '@/app/account/actions';
import { Card, ErrorBox, Field, inputClass, primaryBtn } from '@/components/shop/ui';

const initial: FormState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <Card>
      <form action={action} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        {state.error && <ErrorBox>{state.error}</ErrorBox>}
        <Field label="Email" required>
          <input name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <Field label="Password" required>
          <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
        </Field>
        <button type="submit" disabled={pending} className={`${primaryBtn} w-full`}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-sm text-gray-600 text-center">
          No account yet?{' '}
          <Link href="/account/register" className="font-semibold text-red-600 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </Card>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <Card>
      <form action={action} className="space-y-5">
        {state.error && <ErrorBox>{state.error}</ErrorBox>}
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="First name" required>
            <input name="first_name" autoComplete="given-name" required className={inputClass} />
          </Field>
          <Field label="Last name" required>
            <input name="last_name" autoComplete="family-name" required className={inputClass} />
          </Field>
        </div>
        <Field label="Email" required>
          <input name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Phone">
            <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
          </Field>
          <Field label="Dojo / club">
            <input name="dojo" className={inputClass} />
          </Field>
        </div>
        <Field label="Rank" hint="Helps us verify your membership.">
          <input name="rank" className={inputClass} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Password" required hint="At least 8 characters.">
            <input name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
          </Field>
          <Field label="Confirm password" required>
            <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
          </Field>
        </div>
        <button type="submit" disabled={pending} className={`${primaryBtn} w-full`}>
          {pending ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-sm text-gray-600 text-center">
          Already registered?{' '}
          <Link href="/account/login" className="font-semibold text-red-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </Card>
  );
}
