'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICONS: Record<string, string> = {
  overview: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  orders: 'M6 2l-2 4v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4zM4 6h16M16 10a4 4 0 0 1-8 0',
  membership: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
  addresses: 'M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  details: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

const LINKS = [
  { href: '/account', label: 'Dashboard', icon: 'overview' },
  { href: '/account/orders', label: 'Orders', icon: 'orders' },
  { href: '/account/membership', label: 'Membership', icon: 'membership' },
  { href: '/account/addresses', label: 'Addresses', icon: 'addresses' },
  { href: '/account/details', label: 'Account details', icon: 'details' },
];

export default function AccountNav() {
  const path = usePathname();
  return (
    <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 flex lg:flex-col gap-1 overflow-x-auto">
      {LINKS.map((l) => {
        const active = l.href === '/account' ? path === '/account' : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              active ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={ICONS[l.icon]} />
            </svg>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
