'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createSession, destroySession, safeNext } from '@/lib/auth';
import { createAccount } from '@/lib/accounts';
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
  const row = db().prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email);

  // Same message for unknown email and wrong password.
  if (!row || !verifyPassword(password, row.password_hash as string)) {
    return { error: 'Incorrect email or password.' };
  }
  await createSession(row.id as number);
  await adoptGuestCart(row.id as number);
  redirect(safeNext(fd.get('next')));
}

export async function logoutAction() {
  await destroySession();
  redirect('/');
}
