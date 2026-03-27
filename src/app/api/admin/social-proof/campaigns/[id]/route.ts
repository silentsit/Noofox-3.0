import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/rbac';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'social_proof' });
  if (auth.response) return auth.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.is_active !== undefined) updates.is_active = !!body.is_active;
  if (body.display_mode !== undefined) {
    updates.display_mode =
      body.display_mode === 'live' || body.display_mode === 'evergreen' || body.display_mode === 'mixed'
        ? body.display_mode
        : 'mixed';
  }
  if (body.message_template !== undefined) updates.message_template = String(body.message_template);
  if (body.link_url !== undefined) updates.link_url = body.link_url || null;
  if (body.delay_ms !== undefined) updates.delay_ms = Number(body.delay_ms) || 0;
  if (body.min_interval_ms !== undefined) updates.min_interval_ms = Number(body.min_interval_ms) || 1000;
  if (body.max_interval_ms !== undefined) updates.max_interval_ms = Number(body.max_interval_ms) || 1000;
  if (body.page_include !== undefined) updates.page_include = body.page_include;
  if (body.page_exclude !== undefined) updates.page_exclude = body.page_exclude;
  if (body.evergreen_pool !== undefined) updates.evergreen_pool = body.evergreen_pool;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('social_proof_campaigns')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'social_proof' });
  if (auth.response) return auth.response;

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from('social_proof_campaigns').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ deleted: true });
}
