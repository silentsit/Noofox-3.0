import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/rbac';

export async function GET() {
  const auth = await requireAdminRoute({ action: 'read', resource: 'email' });
  if (auth.response) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase.from('email_automations').select('*').order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'email' });
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const key = typeof body.key === 'string' ? body.key : '';
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = String(body.name);
  if (body.template_key !== undefined) updates.template_key = String(body.template_key);
  if (body.enabled !== undefined) updates.enabled = !!body.enabled;
  if (body.delay_minutes !== undefined) updates.delay_minutes = Math.max(0, Number(body.delay_minutes) || 0);
  if (body.filters !== undefined) updates.filters = body.filters;

  const supabase = await createClient();
  const { data, error } = await supabase.from('email_automations').update(updates).eq('key', key).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

