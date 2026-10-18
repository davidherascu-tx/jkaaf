'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Moves its children slower than the page scrolls (a parallax effect). Put it inside a `relative overflow-hidden`
 * section; it is taller than the section so there is room to move. A negative speed moves the other way.
 * Skipped for people who prefer reduced motion.
 */
export default function ParallaxBg({ children, speed = 0.25, className = '' }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const box = el.parentElement?.getBoundingClientRect();
      if (!box || box.bottom < 0 || box.top > window.innerHeight) return;
      // 0 when the section's top meets the top of the screen; grows as it scrolls away.
      el.style.transform = `translate3d(0, ${(-box.top * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`absolute inset-x-0 -top-[15%] -bottom-[15%] will-change-transform ${className}`}>
      {children}
    </div>
  );
}
