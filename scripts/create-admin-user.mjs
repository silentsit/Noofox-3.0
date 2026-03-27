/**
 * One-off: create or upgrade an admin user via Supabase Auth Admin API.
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 *
 * Usage:
 *   ADMIN_EMAIL=grabmoda@grabmoda.com ADMIN_PASSWORD='...' node scripts/create-admin-user.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const p = join(__dirname, '..', '.env.local');
  if (!existsSync(p)) return;
  const raw = readFileSync(p, 'utf8');
  for (const line of raw.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ADMIN_EMAIL || 'grabmoda@grabmoda.com').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}
if (serviceKey.includes('sb_publishable')) {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY looks wrong. Use the secret service_role JWT from Supabase Dashboard → Project Settings → API (not the anon or publishable key).'
  );
  process.exit(1);
}
if (!password) {
  console.error('Set ADMIN_PASSWORD (and optionally ADMIN_EMAIL).');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let userId = created?.user?.id;

  if (createErr) {
    const msg = createErr.message || '';
    const duplicate =
      msg.toLowerCase().includes('already') ||
      msg.toLowerCase().includes('registered') ||
      createErr.status === 422;

    if (!duplicate) {
      console.error('createUser failed:', createErr.message);
      process.exit(1);
    }

    const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) {
      console.error('listUsers failed:', listErr.message);
      process.exit(1);
    }
    const existing = listData.users.find(
      (u) => (u.email || '').toLowerCase() === email
    );
    if (!existing) {
      console.error('User exists but could not be found by email:', email);
      process.exit(1);
    }
    userId = existing.id;
    const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (updErr) {
      console.error('updateUser failed:', updErr.message);
      process.exit(1);
    }
    console.error('User already existed; password updated and profile will be promoted to admin.');
  }

  if (!userId) {
    console.error('No user id.');
    process.exit(1);
  }

  const { error: profileErr } = await supabase.from('users').upsert(
    {
      id: userId,
      email,
      role: 'admin',
      profile_data: {},
    },
    { onConflict: 'id' }
  );

  if (profileErr) {
    const { error: updateErr } = await supabase
      .from('users')
      .update({ role: 'admin', email })
      .eq('id', userId);
    if (updateErr) {
      console.error('Could not set admin role on public.users:', profileErr.message, updateErr.message);
      process.exit(1);
    }
  }

  const { error: rbacErr } = await supabase.from('user_admin_roles').upsert(
    { user_id: userId, role_key: 'super_admin' },
    { onConflict: 'user_id,role_key' }
  );
  if (rbacErr) {
    console.error('Note: could not assign super_admin RBAC row (legacy admin may still work):', rbacErr.message);
  }

  console.log('OK: admin ready.');
  console.log('Sign in email:', email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
