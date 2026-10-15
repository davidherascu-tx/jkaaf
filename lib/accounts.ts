import 'server-only';
import { queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { adoptGuestCart } from '@/lib/cart';
import { createSession } from '@/lib/auth';
import { allow, clientIp, TOO_MANY } from '@/lib/rateLimit';
import { after } from 'next/server';
import { sendActivationEmail, siteOrigin } from '@/lib/emailVerification';

export interface AccountInput {
  email: string;
  password: string;
  confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
  dojo?: string;
  rank?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and creates a pending, not-yet-activated account. Signs the user in (and keeps their guest cart)
 * only when `signIn` is set; otherwise they must click the activation link in their email first.
 */
export async function createAccount(a: AccountInput, signIn = false): Promise<{ error: string } | { id: number }> {
  const email = a.email.trim().toLowerCase();
  const first = a.first_name.trim();
  const last = a.last_name.trim();
  if (!first || !last) return { error: 'First and last name are required.' };
  if (first.length > 80 || last.length > 80 || email.length > 254) return { error: 'That name or email address is too long.' };
  if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };
  if (a.password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (a.password.length > 200) return { error: 'Password must be at most 200 characters.' };
  if (!(await allow('register:' + (await clientIp()), 10, 3600))) return { error: TOO_MANY };
  if (a.password !== a.confirm) return { error: 'Passwords do not match.' };

  let id: number;
  try {
    const row = await queryOne(
      'insert into users (email, password_hash, first_name, last_name, phone, dojo, rank) values ($1, $2, $3, $4, $5, $6, $7) returning id',
      [email, hashPassword(a.password), first, last, a.phone?.trim() ?? '', a.dojo?.trim() ?? '', a.rank?.trim() ?? ''],
    );
    id = row!.id as number;
  } catch (e) {
    // 23505 = unique violation (email already registered)
    if ((e as { code?: string }).code === '23505') return { error: 'An account with this email already exists. Please sign in instead.' };
    throw e;
  }
  if (signIn) {
    await createSession(id);
    await adoptGuestCart(id);
  }
  after(async () => sendActivationEmail(id, await siteOrigin()));
  return { id };
}
