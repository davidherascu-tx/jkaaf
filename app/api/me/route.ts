import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getCartOwner } from '@/lib/cart';
import { cartCount } from '@/lib/shop';

// Lightweight session + cart info for the navbar (keeps the rest of the site statically renderable).
export async function GET() {
  const [user, owner] = await Promise.all([getUser(), getCartOwner()]);
  return NextResponse.json(
    { name: user?.first_name ?? null, status: user?.status ?? null, cart: owner ? cartCount(owner) : 0 },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
