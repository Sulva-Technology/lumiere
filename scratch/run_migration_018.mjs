/**
 * Applies migration 018 directly over the Supabase PostgreSQL connection.
 * Uses the `postgres` npm package.
 *
 * Usage: node scratch/run_migration_018.mjs <DB_PASSWORD>
 * The DB password is found in Supabase Dashboard → Settings → Database → Connection string
 */
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const password = process.argv[2];

if (!password) {
  console.error('Usage: node scratch/run_migration_018.mjs <DB_PASSWORD>');
  console.error('Get your DB password from: Supabase Dashboard → Settings → Database → Connection string');
  process.exit(1);
}

const sql = postgres({
  host: 'db.sngxumdxszxehbjcwdcd.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password,
  ssl: 'require',
});

const migration = readFileSync(
  resolve(__dirname, '../supabase/migrations/018_general_availability.sql'),
  'utf8'
);

try {
  await sql.unsafe(migration);
  console.log('✓ Migration 018 applied successfully.');
} catch (err) {
  console.error('✗ Migration failed:', err.message);
  process.exit(1);
} finally {
  await sql.end();
}
