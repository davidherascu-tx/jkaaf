import type { ReactNode } from 'react';

/**
 * Renders both designs; globals.css hides whichever one doesn't match
 * <html data-design="...">, which is set before first paint by the inline
 * script in app/layout.tsx and flipped by <DesignToggle />.
 */
export default function DesignVariant({
  modern,
  classic,
}: {
  modern: ReactNode;
  classic: ReactNode;
}) {
  return (
    <>
      <div className="design-modern">{modern}</div>
      <div className="design-classic">{classic}</div>
    </>
  );
}
