export const formatCents = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/** "5", "5.00", "$5.00" -> 500. Returns null if not a valid non-negative amount. */
export function parseDollars(input: string): number | null {
  const s = input.trim().replace(/^\$/, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
}

/** The Shipping line: the shipping amount when shipping is charged, otherwise "Free" (free shipping or pick-up). */
export const shippingText = (shipCents: number, _allFree?: boolean) => (shipCents > 0 ? formatCents(shipCents) : 'Free');
