'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
  n?: number;
  /** Only highlight on an exact match (for overview pages). */
  exact?: boolean;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function AdminNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const active = (i: NavItem) => (i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + '/'));
  return (
    <nav aria-label="Dashboard" className="space-y-6">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">{g.title}</p>
          <ul className="space-y-1">
            {g.items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active(i) ? 'page' : undefined}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    active(i) ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-white hover:text-red-600'
                  }`}
                >
                  <span>{i.label}</span>
                  {!!i.n && (
                    <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs ${active(i) ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
                      {i.n}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
