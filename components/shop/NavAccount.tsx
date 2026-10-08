'use client';

import Link from 'next/link';
import { useMe } from '@/components/shop/useMe';

function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative inline-flex">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2 4h13M9 20a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </span>
  );
}

/** Cart icon with item count. Sign in / account links live in the Shop submenu. */
export default function NavAccount({ variant }: { variant: 'desktop' | 'bar' }) {
  const me = useMe();
  return (
    <Link
      href="/shop/cart"
      aria-label="Cart"
      className={`p-2 text-gray-700 hover:text-red-600 transition-colors ${variant === 'bar' ? 'inline-flex' : 'ml-1'}`}
    >
      <CartIcon count={me?.cart ?? 0} />
    </Link>
  );
}
