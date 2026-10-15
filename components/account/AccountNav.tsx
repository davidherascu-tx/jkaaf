'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NavSelect, { type SelectItem } from '@/components/NavSelect';

const LINKS: SelectItem[] = [
  { href: '/account', label: 'Dashboard', exact: true, icon: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { href: '/account/orders', label: 'Orders', icon: 'M6 2l-2 4v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4zM4 6h16M16 10a4 4 0 0 1-8 0' },
  { href: '/account/membership', label: 'Membership', icon: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z' },
  { href: '/account/addresses', label: 'Addresses', icon: 'M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
  { href: '/account/details', label: 'Account details', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
];

const ADMIN_LINK: SelectItem = {
  href: '/admin',
  label: 'Admin dashboard',
  icon: 'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3zM9 12l2 2 4-4',
};

export default function AccountNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const path = usePathname();
  const links = isAdmin ? [...LINKS, ADMIN_LINK] : LINKS;
  return (
    <>
      {/* Phones: pick where to go */}
      <NavSelect groups={isAdmin ? [{ items: LINKS }, { title: 'Admin', items: [ADMIN_LINK] }] : [{ items: LINKS }]} />

      {/* Desktop: sidebar */}
      <nav className="hidden lg:flex flex-col gap-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-2" aria-label="Account">
        {links.map((l) => {
          const startsAdmin = l === ADMIN_LINK;
          const active = l.exact ? path === l.href : path.startsWith(l.href);
          return (
            <div key={l.href} className={startsAdmin ? 'mt-2 pt-3 border-t-2 border-gray-100' : ''}>
              <Link
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                active ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={l.icon} />
              </svg>
              {l.label}
            </Link>
            </div>
          );
        })}
      </nav>
    </>
  );
}
