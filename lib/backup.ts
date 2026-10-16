import 'server-only';
import { db, query } from '@/lib/db';

// Backup and restore of everything the shop stores: members, orders, subscriptions, payments, applications and products.
// Website content (events, news, dojos) lives in Sanity and has its own export (see README).

/** Parents before children: this is the order rows are inserted in. It is reversed when deleting. */
export const BACKUP_TABLES = ['users', 'products', 'addresses', 'orders', 'order_items', 'payments', 'refunds', 'dojo_applications', 'cart_items'] as const;
export type BackupTable = (typeof BACKUP_TABLES)[number];

export interface BackupFile {
  app: 'jkaaf-shop';
  version: 1;
  exportedAt: string;
  tables: Record<BackupTable, Record<string, unknown>[]>;
}

const ORDER_BY: Record<BackupTable, string> = {
  users: 'id',
  products: 'id',
  addresses: 'user_id, kind',
  orders: 'id',
  order_items: 'id',
  payments: 'id',
  refunds: 'id',
  dojo_applications: 'id',
  cart_items: 'id',
};

export async function exportAll(): Promise<BackupFile> {
  const tables = {} as BackupFile['tables'];
  for (const t of BACKUP_TABLES) tables[t] = await query(`select * from ${t} order by ${ORDER_BY[t]}`);
  return { app: 'jkaaf-shop', version: 1, exportedAt: new Date().toISOString(), tables };
}

export async function currentCounts(): Promise<Record<BackupTable, number>> {
  const out = {} as Record<BackupTable, number>;
  for (const t of BACKUP_TABLES) out[t] = Number((await query(`select count(*) as n from ${t}`))[0].n);
  return out;
}

/** Checks a parsed file is a backup we can restore. Returns an error message or null. */
export function validateBackup(file: unknown): string | null {
  const f = file as Partial<BackupFile> | null;
  if (!f || typeof f !== 'object' || f.app !== 'jkaaf-shop') return 'This is not a JKA/AF backup file.';
  if (f.version !== 1) return 'This backup was made by a different version and cannot be restored here.';
  if (!f.tables || typeof f.tables !== 'object') return 'The backup has no data in it.';
  for (const t of BACKUP_TABLES) {
    if (!Array.isArray(f.tables[t])) return `The backup is missing the "${t}" data.`;
  }
  // Without an admin in the file the dashboard could not be opened again after restoring.
  if (!f.tables.users.some((u) => u.role === 'admin')) return 'The backup has no admin account, so restoring it would lock you out of the dashboard.';
  return null;
}

/**
 * Restores a backup: replaces ALL shop data with what is in the file, in one all-or-nothing transaction
 * (if anything is wrong the database is left exactly as it was). Everyone is signed out afterwards.
 */
export async function importAll(file: BackupFile): Promise<{ ok: true; counts: Record<BackupTable, number> } | { ok: false; error: string }> {
  const bad = validateBackup(file);
  if (bad) return { ok: false, error: bad };

  const client = await db().connect();
  try {
    await client.query('begin');

    // Column names and types come from the database itself (never from the file), so the file cannot inject SQL.
    const meta = {} as Record<BackupTable, { name: string; json: boolean }[]>;
    const identity = new Set<string>();
    const cols = await client.query(
      "select table_name, column_name, data_type, is_identity from information_schema.columns where table_schema = 'public' and table_name = any($1)",
      [[...BACKUP_TABLES]],
    );
    for (const t of BACKUP_TABLES) meta[t] = [];
    for (const c of cols.rows) {
      meta[c.table_name as BackupTable].push({ name: c.column_name as string, json: c.data_type === 'jsonb' });
      if (c.is_identity === 'YES') identity.add(c.table_name as string);
    }

    // Out with the old (children first). Sessions go too, because the users they belong to are being replaced.
    for (const t of [...BACKUP_TABLES].reverse()) await client.query(`delete from ${t}`);
    await client.query('delete from sessions');
    await client.query('delete from password_resets');
    await client.query('delete from email_verifications');

    // In with the new (parents first).
    for (const t of BACKUP_TABLES) {
      for (const row of file.tables[t]) {
        const present = meta[t].filter((c) => c.name in row);
        if (present.length === 0) continue;
        const names = present.map((c) => `"${c.name}"`).join(', ');
        const marks = present.map((c, i) => (c.json ? `$${i + 1}::jsonb` : `$${i + 1}`)).join(', ');
        const values = present.map((c) => {
          const v = row[c.name];
          return c.json && v !== null && v !== undefined ? JSON.stringify(v) : (v ?? null);
        });
        await client.query(`insert into ${t} (${names}) ${identity.has(t) ? 'overriding system value ' : ''}values (${marks})`, values);
      }
    }

    // New rows must continue after the highest restored id.
    for (const t of BACKUP_TABLES.filter((x) => identity.has(x))) {
      await client.query(`select setval(pg_get_serial_sequence('${t}', 'id'), coalesce((select max(id) from ${t}), 1), (select count(*) > 0 from ${t}))`);
    }

    await client.query('commit');
    const counts = {} as Record<BackupTable, number>;
    for (const t of BACKUP_TABLES) counts[t] = file.tables[t].length;
    return { ok: true, counts };
  } catch (e) {
    await client.query('rollback').catch(() => {});
    console.error('[backup] restore failed and was rolled back:', e);
    return { ok: false, error: `The restore failed and nothing was changed. (${e instanceof Error ? e.message : 'unknown error'})` };
  } finally {
    client.release();
  }
}
