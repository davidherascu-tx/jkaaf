// Creates (or updates the password of) the shop admin account in Supabase.
//   npm run db:admin
// Reads SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL and ADMIN_PASSWORD from .env.local.
import { createClient } from '@supabase/supabase-js';
import { randomBytes, scryptSync } from 'node:crypto';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

// Same format as lib/password.ts
const salt = randomBytes(16);
const hash = scryptSync(ADMIN_PASSWORD, salt, 64);
const password_hash = `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;

const db = createClient(new URL(SUPABASE_URL).origin, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const email = ADMIN_EMAIL.trim().toLowerCase();

const { data: existing, error: findErr } = await db.from('users').select('id').eq('email', email).maybeSingle();
if (findErr) {
  console.error('Could not reach the database:', findErr.message);
  console.error('Did you run supabase/schema.sql in the Supabase SQL Editor?');
  process.exit(1);
}

if (existing) {
  const { error } = await db.from('users').update({ password_hash, role: 'admin', status: 'approved' }).eq('id', existing.id);
  if (error) throw new Error(error.message);
  console.log(`Updated admin account: ${email}`);
} else {
  const { error } = await db
    .from('users')
    .insert({ email, password_hash, first_name: 'Site', last_name: 'Admin', role: 'admin', status: 'approved' });
  if (error) throw new Error(error.message);
  console.log(`Created admin account: ${email}`);
}
