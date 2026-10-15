'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import {
  changePasswordAction,
  forgotPasswordAction,
  loginAction,
  registerAction,
  resendActivationAction,
  resetPasswordAction,
  type ForgotState,
  type FormState,
  type PasswordState,
} from '@/app/account/actions';
import { Card, ErrorBox, Field, inputClass, Notice, primaryBtn } from '@/components/shop/ui';
import PhoneInput from '@/components/shop/PhoneInput';

const initial: FormState = {};

export function LoginForm({ next, showRegisterLink = true }: { next: string; showRegisterLink?: boolean }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <Card>
      <form action={action} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        {state.error && <ErrorBox>{state.error}</ErrorBox>}
        {state.needsActivation && (
          <p className="text-sm -mt-2">
            <Link href="/account/activate" className="font-semibold text-red-600 hover:underline">
              Send me a new activation email
            </Link>
          </p>
        )}
        <Field label="Email" required>
          <input name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <Field label="Password" required>
          <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
        </Field>
        <p className="text-sm text-right -mt-2">
          <Link href="/account/forgot" className="font-semibold text-red-600 hover:underline">
            Forgot password?
          </Link>
        </p>
        <button type="submit" disabled={pending} className={`${primaryBtn} w-full`}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        {showRegisterLink && (
        <p className="text-sm text-gray-600 text-center">
          No account yet?{' '}
          <Link href="/account/register" className="font-semibold text-red-600 hover:underline">
            Create one
          </Link>
        </p>
        )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Phone">
            <PhoneInput name="phone" className={inputClass} />
          </Field>
          <Field label="Dojo / club">
            <input name="dojo" className={inputClass} />
          </Field>
        </div>
        <Field label="Rank" hint="Helps us verify your membership.">
          <input name="rank" className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
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

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePasswordAction, {});
  return (
    <form action={action} className="space-y-4 max-w-md" key={state.done ? 'done' : 'form'}>
      {state.error && <ErrorBox>{state.error}</ErrorBox>}
      {state.done && <Notice tone="ok">Your password was changed. Other devices have been signed out.</Notice>}
      <Field label="Current password" required>
        <input name="current" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      <Field label="New password" required hint="At least 8 characters.">
        <input name="next_password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
      </Field>
      <Field label="Confirm new password" required>
        <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(forgotPasswordAction, {});
  if (state.sent) {
    return (
      <Card>
        <Notice tone="ok">
          If an account exists for that email, we sent a link to reset your password. It expires in 1 hour. Check your spam folder if you do not see it.
        </Notice>
        <p className="mt-4 text-sm text-center">
          <Link href="/account/login" className="font-semibold text-red-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    );
  }
  return (
    <Card>
      <form action={action} className="space-y-5">
        {state.error && <ErrorBox>{state.error}</ErrorBox>}
        <Field label="Email" required>
          <input name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <button type="submit" disabled={pending} className={`${primaryBtn} w-full`}>
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
        <p className="text-sm text-gray-600 text-center">
          <Link href="/account/login" className="font-semibold text-red-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </Card>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction.bind(null, token), initial);
  return (
    <Card>
      <form action={action} className="space-y-5">
        {state.error && <ErrorBox>{state.error}</ErrorBox>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
          <Field label="New password" required hint="At least 8 characters.">
            <input name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
          </Field>
          <Field label="Confirm new password" required>
            <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={inputClass} />
          </Field>
        </div>
        <button type="submit" disabled={pending} className={`${primaryBtn} w-full`}>
          {pending ? 'Saving…' : 'Set new password'}
        </button>
      </form>
    </Card>
  );
}

export function ResendActivationForm() {
  const [state, action, pending] = useActionState(resendActivationAction, {} as ForgotState);
  if (state.sent) {
    return (
      <Card>
        <Notice tone="ok">If that email has an account waiting to be activated, a new link is on its way. Check your inbox.</Notice>
      </Card>
    );
  }
  return (
    <Card>
      <form action={action} className="space-y-5">
        {state.error && <ErrorBox>{state.error}</ErrorBox>}
        <Field label="Email" required>
          <input name="email" type="email" autoComplete="email" required className={inputClass} />
        </Field>
        <button type="submit" disabled={pending} className={`${primaryBtn} w-full`}>
          {pending ? 'Sending…' : 'Send activation email'}
        </button>
      </form>
    </Card>
  );
}
