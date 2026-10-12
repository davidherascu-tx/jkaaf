// Creates (or updates the password of) the shop admin account in Neon.
//   npm run db:admin
// Reads DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD from .env.local.
import { randomBytes, scryptSync } from 'node:crypto';
import pg from 'pg';

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first.');
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

const email = ADMIN_EMAIL.trim().toLowerCase();
const client = new pg.Client({ connectionString: DATABASE_URL });
try {
  await client.connect();
  const found = await client.query('select id from users where lower(email) = $1', [email]);
  if (found.rows.length) {
    await client.query("update users set password_hash = $1, role = 'admin', status = 'approved' where id = $2", [
      password_hash,
      found.rows[0].id,
    ]);
    console.log(`Updated admin account: ${email}`);
  } else {
    await client.query(
      "insert into users (email, password_hash, first_name, last_name, role, status) values ($1, $2, 'Site', 'Admin', 'admin', 'approved')",
      [email, password_hash],
    );
    console.log(`Created admin account: ${email}`);
  }
} catch (e) {
  console.error('Database error:', e.message);
  console.error('Did you run  npm run db:migrate  first?');
  process.exitCode = 1;
} finally {
  await client.end();
}
