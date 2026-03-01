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
  const { name, price, description, images, stock_count } = body;

  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name);
  if (price !== undefined) updates.price = parseFloat(price) || 0;
  if (description !== undefined) updates.description = description ? String(description) : null;
  if (images !== undefined) updates.images = Array.isArray(images) ? images : [images];
  if (stock_count !== undefined) updates.stock_count = parseInt(String(stock_count), 10) || 0;

  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = await ensureAdmin();
  if (authErr) return authErr;

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
