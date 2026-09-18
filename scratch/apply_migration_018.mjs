/**
 * Applies migration 018 by POSTing each statement to the Supabase
 * Management API /v1/projects/{ref}/database/query endpoint.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=<personal-access-token> node scratch/apply_migration_018.mjs
 *
 * Or pass the token as first argument:
 *   node scratch/apply_migration_018.mjs <personal-access-token>
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'sngxumdxszxehbjcwdcd';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN ?? process.argv[2];

if (!TOKEN) {
  console.error('ERROR: Provide a Supabase personal access token via SUPABASE_ACCESS_TOKEN env var or as a CLI argument.');
  process.exit(1);
}

const sql = readFileSync(
  resolve(__dirname, '../supabase/migrations/018_general_availability.sql'),
  'utf8'
);

async function runQuery(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

const { ok, status, body } = await runQuery(sql);
if (ok) {
  console.log(`✓ Migration 018 applied successfully (HTTP ${status}).`);
} else {
  console.error(`✗ Migration failed (HTTP ${status}): ${body}`);
  process.exit(1);
}
