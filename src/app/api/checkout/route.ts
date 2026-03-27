import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { OrderItem } from '@/types/database';
import { triggerEmail } from '@/lib/email';
import { getCatalogProductBySlug } from '@/lib/catalog';
import { validateCoupon, recordCouponUsage } from '@/lib/coupons';
import { markAbandonedCartRecovered, upsertEmailSubscriber } from '@/lib/emailAutomation';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { consumeRateLimit } from '@/lib/rateLimit';
import { appendGuardarianTimeline, buildGuardarianCheckoutUrl } from '@/lib/guardarian';

const FREE_SHIPPING_THRESHOLD = 300;
const DEFAULT_SHIPPING_FEE = 20;

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
    coupon_code,
    marketing_opt_in,
    turnstile_token,
  } = body as {
    items?: OrderItem[];
    customer_email?: string;
    billing_address?: unknown;
    shipping_address?: unknown;
    payment_method?: string;
    payment_reference?: string;
    coupon_code?: string;
    marketing_opt_in?: boolean;
    turnstile_token?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Items required' }, { status: 400 });
  }

  const ip = getClientIp(request) ?? 'unknown';
  const rate = await consumeRateLimit('checkout', ip, 20, 300);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many checkout attempts. Please wait a moment and retry.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const humanOk = await verifyTurnstileToken(
    typeof turnstile_token === 'string' ? turnstile_token : '',
    ip
  );
  if (!humanOk) {
    return NextResponse.json(
      { error: 'Human verification failed. Refresh the page and try again.' },
      { status: 403 }
    );
  }

  const validationError = await validateItems(items);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const subtotal_amount = items.reduce(
    (sum, i) => sum + Number(i.price) * (i.quantity || 1),
    0
  );

  const ip_address = getClientIp(request);
  const user_agent = getUserAgent(request);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const customer_email =
    (bodyEmail as string)?.trim() ||
    (user?.email ?? null);

  let discount_amount = 0;
  let applied_coupon_code: string | null = null;
  let coupon_id: string | null = null;

  if (coupon_code && typeof coupon_code === 'string' && coupon_code.trim()) {
    const result = await validateCoupon(
      coupon_code,
      subtotal_amount,
      user?.id ?? null,
      customer_email,
      items
    );
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    discount_amount = result.discount;
    applied_coupon_code = result.coupon.code;
    coupon_id = result.coupon.id;
  }

  const discounted_subtotal = Math.max(0, subtotal_amount - discount_amount);
  const shipping_amount = discounted_subtotal > FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  let total_amount = discounted_subtotal + shipping_amount;
  const payMethod = String(payment_method ?? '');

  total_amount = Math.round(total_amount * 100) / 100;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      customer_email: customer_email || null,
      items,
      status: 'Pending Payment',
      subtotal_amount,
      shipping_amount,
      discount_amount,
      coupon_code: applied_coupon_code,
      total_amount,
      payment_method: payment_method ?? null,
      payment_gateway: payMethod === 'pay_card' ? 'guardarian' : null,
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

  if (coupon_id) {
    void recordCouponUsage(coupon_id, order.id, user?.id ?? null, customer_email);
  }

  let guardarianUrl: string | null = null;
  if (payMethod === 'pay_card') {
    guardarianUrl = buildGuardarianCheckoutUrl({
      orderId: order.id,
      customerEmail: customer_email,
      amountUsd: total_amount,
    });
    void appendGuardarianTimeline(order.id, 'Guardarian checkout initialized for card-to-crypto payment.', {
      provider: 'guardarian',
      checkout_url: guardarianUrl,
      amount_usd: total_amount,
    });
  }

  if (customer_email) {
    void markAbandonedCartRecovered(customer_email);
    if (marketing_opt_in) {
      const shipping = shipping_address as Record<string, unknown> | null;
      void upsertEmailSubscriber({
        email: customer_email,
        userId: user?.id ?? null,
        firstName: typeof shipping?.first_name === 'string' ? shipping.first_name : null,
        lastName: typeof shipping?.last_name === 'string' ? shipping.last_name : null,
        source: 'checkout',
        metadata: {
          order_id: order.id,
        },
      });
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (request.url ? new URL(request.url).origin : '');
  const payload = {
    order_id: order.id,
    customer_email: customer_email ?? undefined,
    total_amount,
    items,
    shipping_address: shipping_address ?? undefined,
    coupon_code: applied_coupon_code ?? undefined,
    discount_amount: discount_amount > 0 ? discount_amount : undefined,
    shipping_amount,
  };

  if (baseUrl) {
    void triggerEmail(baseUrl, 'order_placed', payload);
    void triggerEmail(baseUrl, 'admin_new_order', payload);
    const highValueThreshold = Number(process.env.EMAIL_HIGH_VALUE_THRESHOLD ?? 0);
    if (highValueThreshold > 0 && total_amount >= highValueThreshold) {
      void triggerEmail(baseUrl, 'admin_high_value_order', payload);
    }
  }

  return NextResponse.json({ orderId: order.id, guardarianUrl });
}
