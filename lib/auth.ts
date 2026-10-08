import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import { cache } from 'react';
import { db } from '@/lib/db';

const COOKIE = 'jkaaf_session';
const SESSION_DAYS = 14;

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  dojo: string;
  rank: string;
  role: 'customer' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const USER_COLS = 'u.id, u.email, u.first_name, u.last_name, u.phone, u.dojo, u.rank, u.role, u.status, u.created_at';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

export async function createSession(userId: number) {
  const token = randomBytes(32).toString('hex');
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  db().prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha(token), userId, expires);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expires),
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) db().prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token));
  store.delete(COOKIE);
}

/** Current user or null. Memoized per request. */
export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT ${USER_COLS} FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(sha(token), Date.now());
  return (row as unknown as User) ?? null;
});

export function getUserById(id: number): User | null {
  const row = db().prepare(`SELECT ${USER_COLS} FROM users u WHERE u.id = ?`).get(id);
  return (row as unknown as User) ?? null;
}

export async function requireUser(next = '/shop'): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** Signed in AND approved by an admin (or an admin). */
export async function requireApproved(next = '/shop'): Promise<User> {
  const user = await requireUser(next);
  if (user.status !== 'approved') redirect('/account');
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getUser();
  if (!user) redirect('/account/login?next=/shop-admin');
  if (user.role !== 'admin') redirect('/account');
  return user;
}

/** Only allow same-site relative redirects after login. */
export function safeNext(next: unknown, fallback = '/account'): string {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}
