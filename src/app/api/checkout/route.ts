import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { OrderItem } from '@/types/database';
import { triggerEmail } from '@/lib/email';
import { getCatalogProductBySlug } from '@/lib/catalog';

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return null;
}

function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent');
}

/** Validate cart items against catalog (slug::variantId); return error message or null */
async function validateItems(items: OrderItem[]): Promise<string | null> {
  for (const item of items) {
    const id = String(item.product_id ?? '');
    const parts = id.split('::');
    const slug = parts[0];
    const variantId = parts[1];
    if (!slug || !variantId) {
      return `Invalid item: ${id}`;
    }
    const product = await getCatalogProductBySlug(slug);
    if (!product) {
      return `Product not found: ${slug}`;
    }
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) {
      return `Variant not found: ${slug}::${variantId}`;
    }
    const expectedPrice = variant.price;
    const actualPrice = Number(item.price);
    if (Math.abs(actualPrice - expectedPrice) > 0.01) {
      return `Price mismatch for ${product.name}: expected ${expectedPrice}, got ${actualPrice}`;
    }
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const {
    items,
    customer_email: bodyEmail,
    billing_address,
    shipping_address,
    payment_method,
    payment_reference,
  } = body as {
    items?: OrderItem[];
    customer_email?: string;
    billing_address?: unknown;
    shipping_address?: unknown;
    payment_method?: string;
    payment_reference?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Items required' }, { status: 400 });
  }

  const validationError = await validateItems(items);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  let total_amount = items.reduce(
    (sum, i) => sum + Number(i.price) * (i.quantity || 1),
    0
  );
  /** Match storefront “Pay with Crypto (15% Off)” — applied server-side only for this method. */
  const payMethod = String(payment_method ?? '');
  if (payMethod === 'pay_crypto') {
    total_amount = Math.round(total_amount * 85) / 100;
  }
  const ip_address = getClientIp(request);
  const user_agent = getUserAgent(request);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const customer_email =
    (bodyEmail as string)?.trim() ||
    (user?.email ?? null);

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      customer_email: customer_email || null,
      items,
      status: 'Pending Payment',
      total_amount,
      payment_method: payment_method ?? null,
      payment_reference: payment_reference?.trim() || null,
      billing_address: billing_address ?? null,
      shipping_address: shipping_address ?? null,
      ip_address: ip_address ?? null,
      user_agent: user_agent ?? null,
      internal_notes: [],
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (request.url ? new URL(request.url).origin : '');
  const payload = {
    order_id: order.id,
    customer_email: customer_email ?? undefined,
    total_amount,
    items,
    shipping_address: shipping_address ?? undefined,
  };

  if (baseUrl) {
    void triggerEmail(baseUrl, 'order_placed', payload);
    void triggerEmail(baseUrl, 'admin_new_order', payload);
    const highValueThreshold = Number(process.env.EMAIL_HIGH_VALUE_THRESHOLD ?? 0);
    if (highValueThreshold > 0 && total_amount >= highValueThreshold) {
      void triggerEmail(baseUrl, 'admin_high_value_order', payload);
    }
  }

  return NextResponse.json({ orderId: order.id });
}
