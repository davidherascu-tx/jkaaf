import 'server-only';
import { headers } from 'next/headers';
import { query } from '@/lib/db';

/** The visitor's IP address (behind the host's proxy), or "unknown". */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0] ?? h.get('x-real-ip') ?? 'unknown').trim().slice(0, 64);
}

/**
 * Counts one attempt for `key` and says whether it is still allowed: at most `max` per `windowSec` seconds.
 * Stored in the database, so the limit holds across servers and restarts.
 */
export async function allow(key: string, max: number, windowSec: number): Promise<boolean> {
  const now = Date.now();
  const rows = await query(
    `insert into rate_limits (key, count, reset_at) values ($1, 1, $2)
     on conflict (key) do update set
       count = case when rate_limits.reset_at < $3 then 1 else rate_limits.count + 1 end,
       reset_at = case when rate_limits.reset_at < $3 then $2 else rate_limits.reset_at end
     returning count`,
    [key.slice(0, 200), now + windowSec * 1000, now],
  );
  // Housekeeping: old windows are useless.
  if (Math.random() < 0.02) await query('delete from rate_limits where reset_at < $1', [now - 86_400_000]);
  return Number(rows[0]?.count ?? 1) <= max;
}

export const TOO_MANY = 'Too many attempts. Please wait a few minutes and try again.';
