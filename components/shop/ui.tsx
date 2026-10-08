import type { ReactNode } from 'react';

export const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors bg-white';

export const primaryBtn =
  'inline-flex items-center justify-center gap-2 bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

export const secondaryBtn =
  'inline-flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold px-5 py-2.5 rounded-xl border border-gray-300 hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer';

export function PageShell({
  title,
  subtitle,
  children,
  wide,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  wide?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div className="bg-gray-50 flex-1 w-full pt-28 md:pt-36 pb-16">
      <div className={`${wide ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-4 sm:px-6 lg:px-8 w-full`}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
            <div className="w-16 h-1.5 bg-red-600 rounded-full mt-3 mb-3" />
            {subtitle && <p className="text-gray-600 max-w-2xl">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 ${className}`}>{children}</div>;
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-1.5">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">
      {children}
    </div>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'ok'; children: ReactNode }) {
  const tones = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    ok: 'border-green-200 bg-green-50 text-green-900',
  };
  return <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

const BADGES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  awaiting_payment: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  paid: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-200 text-gray-700',
  admin: 'bg-purple-100 text-purple-800',
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full capitalize ${BADGES[value] ?? 'bg-gray-100 text-gray-700'}`}>
      {label ?? value.replace('_', ' ')}
    </span>
  );
}
