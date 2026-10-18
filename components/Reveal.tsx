'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Fades and slides its content in when it scrolls into view. Content is fully visible on the server and without
 * JavaScript; it is only hidden (when it starts below the fold) once the page has loaded. Skipped for people who
 * prefer reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  /** Milliseconds to wait before animating (use to stagger cards). */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'visible' | 'hidden' | 'shown'>('visible');

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // already on screen: leave it be
    setState('hidden');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('shown');
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${state === 'hidden' ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'} transition-[opacity,transform] duration-700 ease-out will-change-transform`}
      style={{ transitionDelay: state === 'shown' ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
