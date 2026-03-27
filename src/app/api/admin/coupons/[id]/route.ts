import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/audit';
import { requireAdminRoute } from '@/lib/rbac';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'coupons' });
  if (auth.response) return auth.response;

  const { id } = await params;
  const body = await request.json();

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.code !== undefined) updates.code = String(body.code).trim().toUpperCase();
  if (body.description !== undefined) updates.description = body.description || null;
  if (body.discount_type !== undefined) updates.discount_type = body.discount_type === 'fixed' ? 'fixed' : 'percentage';
  if (body.discount_value !== undefined) updates.discount_value = parseFloat(body.discount_value) || 0;
  if (body.min_order_amount !== undefined) updates.min_order_amount = parseFloat(body.min_order_amount) || 0;
  if (body.max_discount_amount !== undefined) updates.max_discount_amount = body.max_discount_amount ? parseFloat(body.max_discount_amount) : null;
  if (body.usage_limit !== undefined) updates.usage_limit = body.usage_limit ? parseInt(body.usage_limit, 10) : null;
  if (body.usage_limit_per_user !== undefined) updates.usage_limit_per_user = body.usage_limit_per_user ? parseInt(body.usage_limit_per_user, 10) : null;
  if (body.is_active !== undefined) updates.is_active = !!body.is_active;
  if (body.starts_at !== undefined) updates.starts_at = body.starts_at || null;
  if (body.expires_at !== undefined) updates.expires_at = body.expires_at || null;

  const { data, error } = await supabase
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAuditLog({
    action: 'update',
    resourceType: 'coupon',
    resourceId: id,
    oldData: { code: existing.code, is_active: existing.is_active },
    newData: updates,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'coupons' });
  if (auth.response) return auth.response;

  const { id } = await params;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('coupons')
    .select('id, code')
    .eq('id', id)
    .single();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAuditLog({
    action: 'delete',
    resourceType: 'coupon',
    resourceId: id,
    oldData: { code: existing.code },
  });

  return NextResponse.json({ deleted: true });
}
