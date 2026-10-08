import 'server-only';
import { db, ok } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { adoptGuestCart } from '@/lib/cart';
import { createSession } from '@/lib/auth';

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

/** Validates, creates a pending member account, signs the user in and keeps their guest cart. */
export async function createAccount(a: AccountInput): Promise<{ error: string } | { id: number }> {
  const email = a.email.trim().toLowerCase();
  const first = a.first_name.trim();
  const last = a.last_name.trim();
  if (!first || !last) return { error: 'First and last name are required.' };
  if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };
  if (a.password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (a.password !== a.confirm) return { error: 'Passwords do not match.' };

  const res = await db()
    .from('users')
    .insert({
      email,
      password_hash: hashPassword(a.password),
      first_name: first,
      last_name: last,
      phone: a.phone?.trim() ?? '',
      dojo: a.dojo?.trim() ?? '',
      rank: a.rank?.trim() ?? '',
    })
    .select('id')
    .single();
  if (res.error) {
    // 23505 = unique violation (email already registered)
    if (res.error.code === '23505') return { error: 'An account with this email already exists. Please sign in instead.' };
    throw new Error(res.error.message);
  }
  const id = ok(res).id as number;
  await createSession(id);
  await adoptGuestCart(id);
  return { id };
}
