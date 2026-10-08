import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from '@/lib/password';
import { SEED } from '@/lib/products';

const DB_PATH = process.env.SHOP_DB_PATH || path.join(process.cwd(), 'data', 'shop.db');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  dojo TEXT NOT NULL DEFAULT '',
  rank TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL,
  price_note TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sale_price_cents INTEGER,
  sale_ends_on TEXT NOT NULL DEFAULT '',
  stock INTEGER,
  free_shipping INTEGER NOT NULL DEFAULT 1,
  options_json TEXT NOT NULL DEFAULT '[]',
  physical INTEGER NOT NULL DEFAULT 0,
  requires_dojo_approval INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  cart_token TEXT,
  product_id INTEGER NOT NULL,
  selections_json TEXT NOT NULL DEFAULT '{}',
  quantity INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'awaiting_payment',
  payment_method TEXT NOT NULL DEFAULT 'check',
  total_cents INTEGER NOT NULL,
  ship_name TEXT NOT NULL DEFAULT '',
  ship_address TEXT NOT NULL DEFAULT '',
  ship_city TEXT NOT NULL DEFAULT '',
  ship_state TEXT NOT NULL DEFAULT '',
  ship_zip TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  name TEXT NOT NULL,
  unit_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  selections_json TEXT NOT NULL DEFAULT '[]',
  recurring INTEGER NOT NULL DEFAULT 0,
  free_shipping INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS dojo_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  dojo_name TEXT NOT NULL,
  chief_instructor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  data_json TEXT NOT NULL,
  signature TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT
);
`;
// status values: users pending|approved|rejected; orders awaiting_payment|paid|completed|cancelled;
// dojo_applications pending|approved|rejected.

function columns(db: DatabaseSync, table: string): string[] {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((r) => r.name as string);
}

function init(db: DatabaseSync) {
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  // Migrations for databases created before guest carts / product images existed.
  if (columns(db, 'cart_items').length > 0 && !columns(db, 'cart_items').includes('cart_token')) {
    db.exec('DROP TABLE cart_items');
  }
  db.exec(SCHEMA);
  if (!columns(db, 'products').includes('stock')) db.exec('ALTER TABLE products ADD COLUMN stock INTEGER');
  if (!columns(db, 'products').includes('free_shipping')) {
    db.exec('ALTER TABLE products ADD COLUMN free_shipping INTEGER NOT NULL DEFAULT 1');
  }
  if (!columns(db, 'order_items').includes('free_shipping')) {
    db.exec('ALTER TABLE order_items ADD COLUMN free_shipping INTEGER NOT NULL DEFAULT 1');
  }

  const { n: productCount } = db.prepare('SELECT COUNT(*) AS n FROM products').get() as { n: number };
  if (productCount === 0) {
    const ins = db.prepare(
      `INSERT INTO products (slug, name, description, price_cents, price_note, image_url, sale_price_cents, sale_ends_on, stock, free_shipping, options_json, physical, requires_dojo_approval, active, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const p of SEED) {
      ins.run(p.slug, p.name, p.description, p.price_cents, p.price_note, p.image_url, p.sale_price_cents, p.sale_ends_on, p.stock, p.free_shipping ? 1 : 0, JSON.stringify(p.options), p.physical ? 1 : 0, p.requires_dojo_approval ? 1 : 0, p.active ? 1 : 0, p.sort);
    }
  }

  // Bootstrap the first admin from env vars (see .env.example).
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    if (!exists) {
      db.prepare(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, status)
         VALUES (?, ?, 'Site', 'Admin', 'admin', 'approved')`,
      ).run(adminEmail, hashPassword(adminPassword));
    }
  }
}

const g = globalThis as unknown as { __shopDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (!g.__shopDb) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const d = new DatabaseSync(DB_PATH);
    init(d);
    g.__shopDb = d;
  }
  return g.__shopDb;
}

/** Run fn inside a transaction; rolls back if it throws. */
export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec('BEGIN');
  try {
    const out = fn();
    d.exec('COMMIT');
    return out;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}
