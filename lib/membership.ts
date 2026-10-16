// Membership dates. A membership covers the calendar year it was ordered in (January 1 - December 31),
// whatever day in the year it was bought. Client-safe: no server-only imports.

/** The year an order (a "YYYY-MM-DD HH:MM:SS" UTC string) covers. */
export const membershipYear = (orderedAt: string): number => Number(orderedAt.slice(0, 4));

/** "December 31, 2026" */
export const validThroughText = (year: number): string =>
  new Date(Date.UTC(year, 11, 31)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

/** Whole days left until the end of December 31 of `year` (0 once it has passed). */
export function daysLeft(year: number, now: Date = new Date()): number {
  const end = Date.UTC(year, 11, 31, 23, 59, 59);
  return Math.max(0, Math.ceil((end - now.getTime()) / 86_400_000));
}

export const isExpired = (year: number, now: Date = new Date()): boolean => year < now.getUTCFullYear();

/** "152 days left" / "1 day left" / "Expired". */
export function timeLeftText(year: number, now: Date = new Date()): string {
  if (isExpired(year, now)) return 'Expired';
  const d = daysLeft(year, now);
  return d === 1 ? '1 day left' : `${d} days left`;
}

/** "2026-03-04 10:00:00" -> "March 4, 2026" */
export const dateOnlyText = (stamp: string): string =>
  new Date(stamp.slice(0, 10) + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
