import 'server-only';
import { Pool, types } from 'pg';

// Server-only Neon (Postgres) access. Schema: db/schema.sql
// Set DATABASE_URL to the Neon *pooled* connection string (host contains "-pooler").

// bigint (ids, counts) -> number. Safe: ids here never approach 2^53.
types.setTypeParser(20, (v) => Number(v));

const g = globalThis as unknown as { __pg?: { url: string; pool: Pool } };

export function db(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Missing DATABASE_URL. See .env.example.');
  // Rebuild the pool if the setting changed (e.g. .env.local edited while the dev server runs).
  if (g.__pg?.url !== url) {
    void g.__pg?.pool.end();
    g.__pg = { url, pool: new Pool({ connectionString: url, max: 5 }) };
  }
  return g.__pg.pool;
}

export type DbRow = Record<string, unknown>;

/** Runs a query and returns all rows. */
export async function query(text: string, params: unknown[] = []): Promise<DbRow[]> {
  const res = await db().query(text, params);
  return res.rows as DbRow[];
}

/** First row, or null. */
export async function queryOne(text: string, params: unknown[] = []): Promise<DbRow | null> {
  return (await query(text, params))[0] ?? null;
}

/** Timestamps are shown as "YYYY-MM-DD HH:MM:SS" (UTC). */
export const ts = (v: Date | string | null | undefined): string => {
  if (!v) return '';
  const iso = v instanceof Date ? v.toISOString() : v;
  return iso.replace('T', ' ').slice(0, 19);
};
