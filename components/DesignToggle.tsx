'use client';
import { usePathname } from 'next/navigation';

type Design = 'modern' | 'classic';

// The active button is styled from <html data-design> in globals.css (.design-toggle),
// so this needs no React state and can't mismatch during hydration.
export default function DesignToggle() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  const choose = (next: Design) => {
    document.documentElement.setAttribute('data-design', next);
    try {
      localStorage.setItem('design', next);
    } catch {}
  };

  return (
    <div
      className="design-toggle fixed bottom-4 left-4 z-[60] flex rounded-full bg-gray-900 p-1 text-sm font-bold text-white shadow-xl border border-white/10"
      role="group"
      aria-label="Site design"
    >
      {(['modern', 'classic'] as const).map((d) => (
        <button
          key={d}
          data-design-option={d}
          onClick={() => choose(d)}
          className="px-4 py-2 rounded-full capitalize text-white/70 hover:text-white transition-colors"
        >
          {d}
        </button>
      ))}
    </div>
  );
}
