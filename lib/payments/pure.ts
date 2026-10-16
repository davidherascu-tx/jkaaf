// Pure helpers for the payment providers (no secrets, no server-only imports, so they can be tested on their own).
import { createHmac, timingSafeEqual } from 'node:crypto';

/** Stripe wants form-encoded bodies with bracket keys: line_items[0][quantity]=1. */
export function formEncode(obj: Record<string, unknown>): string {
  const pairs: string[] = [];
  const walk = (value: unknown, key: string) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${key}[${i}]`));
    else if (typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, `${key}[${k}]`);
    else pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };
  for (const [k, v] of Object.entries(obj)) walk(v, k);
  return pairs.join('&');
}

/**
 * Checks the `Stripe-Signature` header of a webhook: "t=timestamp,v1=hmac". The signed text is `${t}.${rawBody}`.
 * Rejects anything older than `toleranceSec` so a captured request cannot be replayed later.
 */
export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  nowSec: number = Math.floor(Date.now() / 1000),
  toleranceSec = 300,
): boolean {
  if (!header || !secret) return false;
  const parts = header.split(',').map((p) => p.trim().split('='));
  const t = parts.find(([k]) => k === 't')?.[1];
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || signatures.length === 0 || !/^\d+$/.test(t)) return false;
  if (Math.abs(nowSec - Number(t)) > toleranceSec) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest();
  return signatures.some((sig) => {
    if (!/^[0-9a-f]+$/i.test(sig)) return false;
    const given = Buffer.from(sig, 'hex');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/** 6000 -> "60.00" (PayPal wants decimal strings). */
export const centsToDecimal = (cents: number): string => (cents / 100).toFixed(2);

/** "60.00" -> 6000 */
export const decimalToCents = (value: string | number): number => Math.round(Number(value) * 100);
