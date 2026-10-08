import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'node:crypto';
import { cache } from 'react';
import { db, ok, ts } from '@/lib/db';

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

/** Columns that are safe to load (never the password hash). */
export const USER_COLS = 'id, email, first_name, last_name, phone, dojo, rank, role, status, created_at';

export const toUser = (r: Record<string, unknown>): User => ({ ...(r as unknown as User), created_at: ts(r.created_at as string) });

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

export async function createSession(userId: number) {
  const token = randomBytes(32).toString('hex');
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  ok(await db().from('sessions').insert({ token_hash: sha(token), user_id: userId, expires_at: expires }));
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expires),
  });
}

/** After a password change: sign out every device, then keep this one signed in. */
export async function replaceAllSessions(userId: number) {
  ok(await db().from('sessions').delete().eq('user_id', userId));
  await createSession(userId);
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) ok(await db().from('sessions').delete().eq('token_hash', sha(token)));
  store.delete(COOKIE);
}

/** Current user or null. Memoized per request. */
export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = ok(
    await db().from('sessions').select('user_id').eq('token_hash', sha(token)).gt('expires_at', Date.now()).maybeSingle(),
  );
  if (!session) return null;
  return getUserById(session.user_id as number);
});

export async function getUserById(id: number): Promise<User | null> {
  const row = ok(await db().from('users').select(USER_COLS).eq('id', id).maybeSingle());
  return row ? toUser(row) : null;
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
