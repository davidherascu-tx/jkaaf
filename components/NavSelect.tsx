'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

export interface SelectItem {
  href: string;
  label: string;
  /** Badge number (for example pending items). */
  n?: number;
  /** Only highlight on an exact match (overview pages). */
  exact?: boolean;
  /** SVG path for a 24x24 outline icon. */
  icon?: string;
}
export interface SelectGroup {
  title?: string;
  items: SelectItem[];
}

const Icon = ({ d, className = 'w-5 h-5' }: { d: string; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const MENU = 'M4 6h16M4 12h16M4 18h16';

/**
 * Phone navigation: one button that shows where you are; tap it to pick where to go.
 * Hidden from the `lg` breakpoint up, where the pages show a sidebar instead.
 */
export default function NavSelect({ groups, footer }: { groups: SelectGroup[]; footer?: ReactNode }) {
  const pathname = usePathname();
  // Open only for the page it was opened on, so choosing a link (a new pathname) closes it by itself.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  const all = groups.flatMap((g) => g.items);
  const isActive = (i: SelectItem) => (i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + '/'));
  // Prefer the longest matching link (so /admin/shop/orders wins over /admin/shop).
  const current = all.filter(isActive).sort((a, b) => b.href.length - a.href.length)[0] ?? all[0];

  return (
    <div className="lg:hidden relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpenOn(open ? null : pathname)}
        className="w-full flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-3 py-2.5 text-left cursor-pointer"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
            <Icon d={current?.icon ?? MENU} />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Go to</span>
            <span className="block font-bold text-gray-900 truncate">{current?.label}</span>
          </span>
        </span>
        <svg viewBox="0 0 24 24" className={`w-5 h-5 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpenOn(null)} />
          <div role="menu" className="absolute z-40 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl p-2 max-h-[70vh] overflow-y-auto">
            {groups.map((g, gi) => (
              <div key={g.title ?? gi} className={gi > 0 ? 'mt-1 pt-1 border-t border-gray-100' : ''}>
                {g.title && <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">{g.title}</p>}
                {g.items.map((i) => {
                  const active = i === current;
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      role="menuitem"
                      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 font-semibold transition-colors ${
                        active ? 'bg-red-50 text-red-700' : 'text-gray-800 active:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {i.icon && <Icon d={i.icon} className="w-5 h-5 text-gray-400" />}
                        {i.label}
                      </span>
                      {!!i.n && <span className="min-w-6 rounded-full bg-red-600 px-2 py-0.5 text-center text-xs font-bold text-white">{i.n}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
            {footer && <div className="mt-1 pt-2 border-t border-gray-100 px-3 pb-2 text-sm">{footer}</div>}
          </div>
        </>
      )}
    </div>
  );
}
