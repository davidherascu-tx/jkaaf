// Creates the shop tables, functions and starter products in your Neon database.
//   npm run db:migrate
// Reads DATABASE_URL from .env.local. Safe to re-run.
import { readFileSync } from 'node:fs';
import pg from 'pg';

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('Set DATABASE_URL in .env.local first (Neon dashboard -> Connect).');
  process.exit(1);
}

const sql = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();
try {
  await client.query(sql);
  console.log('Database schema is up to date.');
} finally {
  await client.end();
}
