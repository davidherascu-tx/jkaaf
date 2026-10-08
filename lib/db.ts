import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-only Supabase client using the service-role key. It bypasses Row Level Security,
// so it must never reach the browser (the 'server-only' import above enforces that).
// Schema: supabase/schema.sql

const g = globalThis as unknown as { __supabase?: { id: string; client: SupabaseClient } };

export function db(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See .env.example.');
  }
  // Rebuild the client if the settings changed (e.g. .env.local edited while the dev server runs).
  const id = url + '|' + key;
  if (g.__supabase?.id !== id) {
    const client = createClient(new URL(url).origin, key, { auth: { persistSession: false, autoRefreshToken: false } });
    g.__supabase = { id, client };
  }
  return g.__supabase.client;
}

/** Unwraps a Supabase response: throws on error, returns the data. */
export function ok<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export type DbRow = Record<string, unknown>;

/** List query result: throws on error, never null. */
export function rows(res: { data: unknown[] | null; error: { message: string } | null }): DbRow[] {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as DbRow[];
}

/** Single-row result (insert ... select().single()): throws on error or when missing. */
export function one(res: { data: unknown; error: { message: string } | null }): DbRow {
  if (res.error) throw new Error(res.error.message);
  if (!res.data) throw new Error('Expected one row, got none');
  return res.data as DbRow;
}

/** Timestamps come back as ISO strings; the UI shows "YYYY-MM-DD HH:MM:SS" (UTC). */
export const ts = (iso: string | null | undefined): string => (iso ? iso.replace('T', ' ').slice(0, 19) : '');

/** Number of rows in a table, optionally filtered by `column = value`. */
export async function countRows(table: string, where?: Record<string, string | number | boolean>): Promise<number> {
  let q = db().from(table).select('*', { count: 'exact', head: true });
  for (const [k, v] of Object.entries(where ?? {})) q = q.eq(k, v);
  const res = await q;
  if (res.error) throw new Error(res.error.message);
  return res.count ?? 0;
}
