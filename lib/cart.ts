import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { getUser } from '@/lib/auth';
import { mergeGuestCart, type CartOwner } from '@/lib/shop';

const COOKIE = 'jkaaf_cart';

/** Read-only: who owns the current cart? Null for a guest who has not added anything yet. */
export async function getCartOwner(): Promise<CartOwner | null> {
  const user = await getUser();
  if (user) return { userId: user.id };
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? { token } : null;
}

/** For Server Functions: like getCartOwner but creates the guest cookie when needed. */
export async function ensureCartOwner(): Promise<CartOwner> {
  const existing = await getCartOwner();
  if (existing) return existing;
  const token = randomBytes(24).toString('hex');
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return { token };
}

/** Call right after a sign in / sign up so items added as a guest follow the user. */
export async function adoptGuestCart(userId: number) {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return;
  mergeGuestCart(token, userId);
  store.delete(COOKIE);
}
