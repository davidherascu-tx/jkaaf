'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface Me {
  name: string | null;
  status: string | null;
  cart: number;
}

/** Signed-in user + cart count for the navbar. Refreshes on navigation and when the cart changes. */
export function useMe(): Me | null {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let live = true;
    const load = () =>
      fetch('/api/me', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d: Me) => live && setMe(d))
        .catch(() => {});
    load();
    window.addEventListener('cart-updated', load);
    return () => {
      live = false;
      window.removeEventListener('cart-updated', load);
    };
  }, [pathname]);

  return me;
}
