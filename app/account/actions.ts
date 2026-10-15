'use server';

import { redirect } from 'next/navigation';
import { resetPassword, sendPasswordReset } from '@/lib/passwordReset';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, destroySession, getUser, replaceAllSessions, requireUser, safeNext } from '@/lib/auth';
import { createAccount } from '@/lib/accounts';
import { cancelSubscription, findLoginUser, getPasswordHash, setPasswordHash } from '@/lib/shop';
import { adoptGuestCart } from '@/lib/cart';
import { query, queryOne } from '@/lib/db';
import { saveAddress } from '@/lib/addresses';
import { normalizeUsState } from '@/lib/regions';
import { sendActivationEmail } from '@/lib/emailVerification';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { requestApproval } from '@/lib/shop';
import { sendApprovalRequestEmail } from '@/lib/accountEmail';
import {
  sendApprovalRequestReceivedEmail,
  sendPasswordChangedEmail,
  sendSubscriptionCanceledEmail,
  sendWelcomeEmail,
} from '@/lib/customerEmails';
import { activateAccount, resendActivation, siteOrigin } from '@/lib/emailVerification';

export interface FormState {
  error?: string;
  needsActivation?: boolean;
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
  redirect('/account/login?activate=1');
}

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, 'email').toLowerCase();
  const password = String(fd.get('password') ?? '');
  const row = await findLoginUser(email);

  // Same message for unknown email and wrong password.
  if (!row || !verifyPassword(password, row.password_hash)) {
    return { error: 'Incorrect email or password.' };
  }
  if (!row.email_verified && row.role !== 'admin') {
    return { error: 'Please activate your account first: open the activation link we emailed you.', needsActivation: true };
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
  after(() => sendPasswordChangedEmail(user.id));
  return { done: true };
}

/** Sign out: customers go to the sign-in screen, admins to the admin dashboard login. */
export async function logoutAction() {
  const user = await getUser();
  await destroySession();
  redirect(user?.role === 'admin' ? '/admin/login' : '/account/login');
}

/** Admin sign out: back to the admin dashboard sign-in. */
export async function adminLogoutAction() {
  await destroySession();
  redirect('/admin/login');
}

export interface ForgotState {
  error?: string;
  sent?: boolean;
}

/** Always answers the same way so nobody can find out which emails have accounts. */
export async function forgotPasswordAction(_prev: ForgotState, fd: FormData): Promise<ForgotState> {
  const email = str(fd, 'email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  await sendPasswordReset(email, await siteOrigin());
  return { sent: true };
}

/** Sends a fresh activation link. Answers the same way whether or not the email has an unverified account. */
export async function resendActivationAction(_prev: ForgotState, fd: FormData): Promise<ForgotState> {
  const email = str(fd, 'email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  await resendActivation(email, await siteOrigin());
  return { sent: true };
}

export async function activateAccountAction(token: string) {
  const done = await activateAccount(token);
  if (done?.first) after(() => sendWelcomeEmail(done.userId));
  redirect(done ? '/account/login?activated=1' : '/account/activate');
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

// ───────── Account dashboard ─────────

export interface SaveState {
  error?: string;
  saved?: boolean;
  note?: string;
}

export async function updateProfileAction(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const user = await requireUser('/account/details');
  const first = str(fd, 'first_name');
  const last = str(fd, 'last_name');
  if (!first || !last) return { error: 'First and last name are required.' };
  await query('update users set first_name = $1, last_name = $2, phone = $3, dojo = $4, rank = $5 where id = $6', [
    first,
    last,
    str(fd, 'phone').slice(0, 40),
    str(fd, 'dojo').slice(0, 120),
    str(fd, 'rank').slice(0, 80),
    user.id,
  ]);
  revalidatePath('/account', 'layout');
  return { saved: true };
}

/** Starts an email change: needs the password, and the new address must be confirmed from a link sent to it. */
export async function changeEmailAction(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const user = await requireUser('/account/details');
  const email = str(fd, 'new_email').toLowerCase();
  if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (email === user.email.toLowerCase()) return { error: 'That is already your email address.' };
  const hash = await getPasswordHash(user.id);
  if (!hash || !verifyPassword(String(fd.get('password') ?? ''), hash)) return { error: 'Your password is incorrect.' };
  const taken = await queryOne('select 1 as t from users where (lower(email) = $1 or lower(pending_email) = $1) and id <> $2', [email, user.id]);
  if (taken) return { error: 'An account with this email already exists.' };
  await query('update users set pending_email = $1 where id = $2', [email, user.id]);
  await sendActivationEmail(user.id, await siteOrigin());
  revalidatePath('/account/details');
  return { saved: true, note: `We sent a confirmation link to ${email}. Your email changes once you click it.` };
}

export async function cancelEmailChangeAction() {
  const user = await requireUser('/account/details');
  await query('update users set pending_email = null where id = $1', [user.id]);
  await query('delete from email_verifications where user_id = $1', [user.id]);
  revalidatePath('/account/details');
}

const addr = (fd: FormData, p: 'bill' | 'ship', phone: string) => ({
  name: str(fd, p + '_name').slice(0, 120),
  line1: str(fd, p + '_line1').slice(0, 200),
  city: str(fd, p + '_city').slice(0, 80),
  state: normalizeUsState(str(fd, p + '_state')).slice(0, 40),
  zip: str(fd, p + '_zip').slice(0, 20),
  phone,
});
const complete = (a: { name: string; line1: string; city: string; state: string; zip: string }) =>
  !!(a.name && a.line1 && a.city && a.state && a.zip);

/** Saves the billing address and either the same shipping address (checkbox) or a separate one. */
export async function saveAddressesAction(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const user = await requireUser('/account/addresses');
  const phone = str(fd, 'phone').slice(0, 40);
  const billing = addr(fd, 'bill', phone);
  if (!complete(billing)) return { error: 'Please complete the billing address.' };
  const same = str(fd, 'same_shipping') === 'on';
  const shipping = same ? billing : addr(fd, 'ship', phone);
  if (!complete(shipping)) return { error: 'Please complete the shipping address.' };
  await saveAddress(user.id, 'billing', billing);
  await saveAddress(user.id, 'shipping', shipping);
  revalidatePath('/account', 'layout');
  return { saved: true };
}

export async function cancelSubscriptionAction(itemId: number) {
  const user = await requireUser('/account/membership');
  await cancelSubscription(user.id, itemId);
  after(() => sendSubscriptionCanceledEmail(user.id));
  revalidatePath('/account/membership');
}

export async function requestApprovalAction(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const user = await requireUser('/account/membership');
  if (user.status === 'approved') return { error: 'Your membership is already approved.' };
  const dojo = str(fd, 'dojo').slice(0, 120);
  const rank = str(fd, 'rank').slice(0, 80);
  if (!dojo || !rank) return { error: 'Please enter your dojo and rank so we can verify your membership.' };
  await requestApproval(user.id, { dojo, rank, note: str(fd, 'note').slice(0, 1000) });
  after(() => sendApprovalRequestEmail(user.id));
  after(() => sendApprovalRequestReceivedEmail(user.id));
  revalidatePath('/account', 'layout');
  return { saved: true };
}
