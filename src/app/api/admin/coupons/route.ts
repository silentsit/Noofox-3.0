import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/audit';
import { requireAdminRoute } from '@/lib/rbac';

function randomCouponCode(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export async function GET() {
  const auth = await requireAdminRoute({ action: 'read', resource: 'coupons' });
  if (auth.response) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'coupons' });
  if (auth.response) return auth.response;

  const body = await request.json();
  const {
    code,
    generate_code,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    usage_limit,
    usage_limit_per_user,
    is_active,
    starts_at,
    expires_at,
    allow_free_shipping,
    exclude_sale_items,
    product_ids,
    category_slugs,
    email_allowlist,
    brand_keys,
  } = body;

  const finalCode =
    generate_code === true ? randomCouponCode() : code ? String(code).trim().toUpperCase() : '';

  if (!finalCode || discount_value == null) {
    return NextResponse.json(
      { error: 'code (or generate_code) and discount_value are required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: finalCode,
      description: description ? String(description) : null,
      discount_type: discount_type === 'fixed' ? 'fixed' : 'percentage',
      discount_value: parseFloat(discount_value) || 0,
      min_order_amount: parseFloat(min_order_amount) || 0,
      max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
      usage_limit: usage_limit ? parseInt(usage_limit, 10) : null,
      usage_limit_per_user: usage_limit_per_user ? parseInt(usage_limit_per_user, 10) : null,
      is_active: is_active !== false,
      starts_at: starts_at || null,
      expires_at: expires_at || null,
      allow_free_shipping: !!allow_free_shipping,
      exclude_sale_items: !!exclude_sale_items,
      product_ids: Array.isArray(product_ids) ? product_ids : [],
      category_slugs: Array.isArray(category_slugs) ? category_slugs : [],
      email_allowlist: Array.isArray(email_allowlist) ? email_allowlist : [],
      brand_keys: Array.isArray(brand_keys) ? brand_keys : [],
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAuditLog({
    action: 'create',
    resourceType: 'coupon',
    resourceId: data.id,
    newData: { code: data.code, discount_type: data.discount_type, discount_value: data.discount_value },
  });

  return NextResponse.json(data, { status: 201 });
}
