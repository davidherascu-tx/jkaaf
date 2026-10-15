'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import NavSelect from '@/components/NavSelect';

export interface NavItem {
  href: string;
  label: string;
  n?: number;
  /** Only highlight on an exact match (for overview pages). */
  exact?: boolean;
  /** SVG path for the icon shown on phones. */
  icon?: string;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function AdminNav({ groups, mobileFooter }: { groups: NavGroup[]; mobileFooter?: ReactNode }) {
  const pathname = usePathname();
  const active = (i: NavItem) => (i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + '/'));
  return (
    <>
      {/* Phones: pick where to go */}
      <NavSelect groups={groups} footer={mobileFooter} />

      {/* Desktop: sidebar, same look as the account sidebar */}
      <nav aria-label="Admin dashboard" className="hidden lg:flex flex-col gap-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
        {groups.map((g, gi) => (
          <div key={g.title} className={gi > 0 ? 'mt-2 pt-3 border-t-2 border-gray-100' : ''}>
            <p className="px-4 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">{g.title}</p>
            <ul className="space-y-1">
              {g.items.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={active(i) ? 'page' : undefined}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active(i) ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {i.icon && (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d={i.icon} />
                      </svg>
                    )}
                    <span className="flex-1">{i.label}</span>
                    {!!i.n && (
                      <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-bold ${active(i) ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>
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
    </>
  );
}
