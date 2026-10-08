import 'server-only';
import { db } from '@/lib/db';
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
  if (db().prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
    return { error: 'An account with this email already exists. Please sign in instead.' };
  }
  const r = db()
    .prepare('INSERT INTO users (email, password_hash, first_name, last_name, phone, dojo, rank) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(email, hashPassword(a.password), first, last, a.phone?.trim() ?? '', a.dojo?.trim() ?? '', a.rank?.trim() ?? '');
  const id = Number(r.lastInsertRowid);
  await createSession(id);
  await adoptGuestCart(id);
  return { id };
}
