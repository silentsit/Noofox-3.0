import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await ensureAdmin();
  if (authErr) return authErr;

  const { id } = await params;
  const body = await request.json();
  const { alt, title, caption } = body;

  const updates: Record<string, unknown> = {};
  if (alt !== undefined) updates.alt = alt === '' ? null : String(alt);
  if (title !== undefined) updates.title = title === '' ? null : String(title);
  if (caption !== undefined) updates.caption = caption === '' ? null : String(caption);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await ensureAdmin();
  if (authErr) return authErr;

  const { id } = await params;
  const supabase = await createClient();

  const { data: row, error: fetchError } = await supabase
    .from('media')
    .select('file_path')
    .eq('id', id)
    .single();

  if (fetchError || !row) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }

  await supabase.storage.from('media').remove([row.file_path]);
  const { error: deleteError } = await supabase.from('media').delete().eq('id', id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
