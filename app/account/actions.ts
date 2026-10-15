'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { resetPassword, sendPasswordReset } from '@/lib/passwordReset';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, destroySession, replaceAllSessions, requireUser, safeNext } from '@/lib/auth';
import { createAccount } from '@/lib/accounts';
import { findLoginUser, getPasswordHash, setPasswordHash } from '@/lib/shop';
import { adoptGuestCart } from '@/lib/cart';

export interface FormState {
  error?: string;
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

export async function registerAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const res = await createAccount({
    email: str(fd, 'email'),
    password: String(fd.get('password') ?? ''),
    confirm: String(fd.get('confirm') ?? ''),
    first_name: str(fd, 'first_name'),
    last_name: str(fd, 'last_name'),
    phone: str(fd, 'phone'),
    dojo: str(fd, 'dojo'),
    rank: str(fd, 'rank'),
  });
  if ('error' in res) return { error: res.error };
  redirect(safeNext(fd.get('next')));
}

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, 'email').toLowerCase();
  const password = String(fd.get('password') ?? '');
  const row = await findLoginUser(email);

  // Same message for unknown email and wrong password.
  if (!row || !verifyPassword(password, row.password_hash)) {
    return { error: 'Incorrect email or password.' };
  }
  await createSession(row.id);
  await adoptGuestCart(row.id);
  redirect(safeNext(fd.get('next')));
}

export interface PasswordState {
  error?: string;
  done?: boolean;
}

export async function changePasswordAction(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  const user = await requireUser('/account');
  const current = String(fd.get('current') ?? '');
  const next = String(fd.get('next_password') ?? '');
  const confirm = String(fd.get('confirm') ?? '');

  const hash = await getPasswordHash(user.id);
  if (!hash || !verifyPassword(current, hash)) return { error: 'Your current password is incorrect.' };
  if (next.length < 8) return { error: 'The new password must be at least 8 characters.' };
  if (next !== confirm) return { error: 'The new passwords do not match.' };
  if (next === current) return { error: 'Choose a password different from your current one.' };

  await setPasswordHash(user.id, hashPassword(next));
  await replaceAllSessions(user.id);
  return { done: true };
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}

export interface ForgotState {
  error?: string;
  sent?: boolean;
}

/** Always answers the same way so nobody can find out which emails have accounts. */
export async function forgotPasswordAction(_prev: ForgotState, fd: FormData): Promise<ForgotState> {
  const email = str(fd, 'email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https');
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;
  await sendPasswordReset(email, origin.replace(/\/$/, ''));
  return { sent: true };
}

export async function resetPasswordAction(token: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const password = String(fd.get('password') ?? '');
  const confirm = String(fd.get('confirm') ?? '');
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };
  const err = await resetPassword(token, password);
  if (err) return { error: err };
  redirect('/account/login?reset=1');
}
