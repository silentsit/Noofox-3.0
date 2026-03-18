/**
 * Run the blog_posts migration (005) against your Supabase database.
 * Requires: DATABASE_URL in .env.local (Supabase Dashboard → Settings → Database → Connection string → URI)
 *
 * Usage: node scripts/run-blog-migration.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const m = trimmed.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

loadEnvFile(resolve(process.cwd(), '.env.local'));
loadEnvFile(resolve(PROJECT_ROOT, '.env.local'));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing DATABASE_URL in .env.local');
  console.error('Get it from: Supabase Dashboard → Settings → Database → Connection string → URI');
  console.error('Add to .env.local: DATABASE_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@...');
  process.exit(1);
}

async function run() {
  const pg = await import('pg');
  const sqlPath = resolve(PROJECT_ROOT, 'supabase/migrations/005_blog_posts.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  const client = new pg.default.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(sql);
    console.log('Migration 005_blog_posts applied: blog_posts table created.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
