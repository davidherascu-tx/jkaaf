'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Next.js only scrolls to the top of a new page when that page's top is off screen, so clicking a menu link while
 * scrolled down inside the same layout (for example Account -> My orders) could leave the page scrolled. This
 * always starts a newly opened page at the top. It leaves #anchor links and the browser's Back / Forward buttons alone.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const first = useRef(true);
  const popped = useRef(false);

  useEffect(() => {
    const onPop = () => (popped.current = true);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (popped.current) {
      popped.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
