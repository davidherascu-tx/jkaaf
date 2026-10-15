import Link from 'next/link';
import { needsJkaApproval, type Product } from '@/lib/products';

type Lock = 'signin' | 'pending' | 'rejected' | 'dojo' | null;

/** Why this member cannot order the product yet (null = they can). */
export function lockFor(product: Product, user: { status: string } | null, clubs: string[]): Lock {
  if (needsJkaApproval(product)) {
    if (!user) return 'signin';
    if (user.status === 'rejected') return 'rejected';
    if (user.status !== 'approved') return 'pending';
  }
  if (product.requires_dojo_approval && clubs.length === 0) return 'dojo';
  return null;
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function LockNotice({ lock, compact = false }: { lock: Exclude<Lock, null>; compact?: boolean }) {
  const link =
    lock === 'signin'
      ? { href: '/account/login?next=/shop', label: 'Sign in or create an account' }
      : lock === 'dojo'
        ? { href: '/membership/application', label: 'Dojo Membership application' }
        : lock === 'rejected'
          ? { href: '/contact', label: 'Contact JKA/AF' }
          : null;
  const text = lock === 'dojo' ? 'Dojo Membership application required' : 'Approved JKA/AF members only';
  return (
    <div className="space-y-2">
      <div
        role="status"
        className={`flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-500 font-semibold ${compact ? 'py-2.5 text-sm' : 'py-3'}`}
      >
        <LockIcon />
        <span>{text}</span>
      </div>
      {link && (
        <Link href={link.href} className="block text-center text-sm font-semibold text-gray-700 underline underline-offset-4 decoration-gray-300 hover:text-red-600 hover:decoration-red-600">
          {link.label}
        </Link>
      )}
    </div>
  );
}
