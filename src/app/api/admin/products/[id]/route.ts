import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/audit';
import { requireAdminRoute } from '@/lib/rbac';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'products' });
  if (auth.response) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const { name, price, description, images, image_meta, stock_count } = body;

  const supabase = await createClient();
  const { data: previous } = await supabase.from('products').select('*').eq('id', id).single();
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name);
  if (price !== undefined) updates.price = parseFloat(price) || 0;
  if (description !== undefined) updates.description = description ? String(description) : null;
  if (images !== undefined) updates.images = Array.isArray(images) ? images : [images];
  if (image_meta !== undefined) updates.image_meta = image_meta && typeof image_meta === 'object' ? image_meta : {};
  if (stock_count !== undefined) updates.stock_count = parseInt(String(stock_count), 10) || 0;

  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAuditLog({
    action: 'update',
    resourceType: 'product',
    resourceId: id,
    oldData: previous,
    newData: updates,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'products' });
  if (auth.response) return auth.response;

  const { id } = await params;
  const supabase = await createClient();
  const { data: previous } = await supabase.from('products').select('*').eq('id', id).single();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAuditLog({
    action: 'delete',
    resourceType: 'product',
    resourceId: id,
    oldData: previous,
  });

  return NextResponse.json({ ok: true });
}
