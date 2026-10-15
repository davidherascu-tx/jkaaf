import Link from 'next/link';
import type { User } from '@/lib/auth';

const STATES = {
  approved: {
    label: 'Approved',
    detail: 'You can order from the JKA/AF shop.',
    box: 'bg-green-50 border-green-200',
    pill: 'bg-green-600 text-white',
    icon: 'M5 13l4 4L19 7',
  },
  none: {
    label: 'Not requested',
    detail: 'Request approval to order from the JKA/AF shop.',
    box: 'bg-gray-50 border-gray-200',
    pill: 'bg-gray-500 text-white',
    icon: 'M12 8v8M8 12h8',
  },
  pending: {
    label: 'Pending approval',
    detail: 'Your membership is being reviewed by JKA/AF.',
    box: 'bg-amber-50 border-amber-200',
    pill: 'bg-amber-500 text-white',
    icon: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  },
  rejected: {
    label: 'Not approved',
    detail: 'Please contact JKA/AF if you have questions.',
    box: 'bg-red-50 border-red-200',
    pill: 'bg-red-600 text-white',
    icon: 'M6 6l12 12M18 6L6 18',
  },
} as const;

/** The customer's JKA/AF Individual Membership status, shown prominently on the dashboard. */
export default function MembershipCard({ user, compact = false }: { user: User; compact?: boolean }) {
  const key = user.status === 'pending' && !user.approval_requested ? 'none' : user.status;
  const s = STATES[key];
  return (
    <div className={`rounded-2xl border p-5 sm:p-6 flex items-start gap-4 ${s.box}`}>
      <span className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${s.pill}`}>
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={s.icon} />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">JKA/AF Individual Membership</p>
        <p className="text-xl font-extrabold text-gray-900">{s.label}</p>
        <p className="text-sm text-gray-700 mt-0.5">{s.detail}</p>
        {compact && key === 'none' && (
          <Link href="/account/membership" className="inline-block mt-2 text-sm font-bold text-red-600 hover:underline">
            Request approval
          </Link>
        )}
        {key === 'rejected' && (
          <Link href="/contact" className="inline-block mt-2 text-sm font-bold text-red-600 hover:underline">
            Contact JKA/AF
          </Link>
        )}
      </div>
    </div>
  );
}
