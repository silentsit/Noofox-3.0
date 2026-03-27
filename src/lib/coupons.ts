import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getCatalogProductBySlug } from '@/lib/catalog';
import type { Coupon, OrderItem } from '@/types/database';

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discount: number }
  | { valid: false; error: string };

/**
 * Validate and compute the discount for a coupon code at checkout time.
 * Uses service-role when available so guest checkouts (no session) can validate.
 */
function lineSlugs(items: OrderItem[]): string[] {
  return items.map((i) => String(i.product_id ?? '').split('::')[0]).filter(Boolean);
}

export async function validateCoupon(
  code: string,
  subtotal: number,
  userId: string | null,
  customerEmail: string | null,
  items?: OrderItem[]
): Promise<CouponValidationResult> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { valid: false, error: 'Coupon code is required' };

  const service = createServiceClient();
  const supabase = service ?? (await createClient());

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', trimmed)
    .single();

  if (!coupon) return { valid: false, error: 'Invalid coupon code' };
  if (!coupon.is_active) return { valid: false, error: 'This coupon is no longer active' };

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, error: 'This coupon is not yet active' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, error: 'This coupon has expired' };
  }

  if (subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      error: `Minimum order of $${Number(coupon.min_order_amount).toFixed(2)} required`,
    };
  }

  if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, error: 'This coupon has reached its usage limit' };
  }

  if (coupon.usage_limit_per_user !== null) {
    const perUserUsed = await countUserUsage(supabase, coupon.id, userId, customerEmail);
    if (perUserUsed >= coupon.usage_limit_per_user) {
      return { valid: false, error: 'You have already used this coupon' };
    }
  }

  const allowlist = (coupon as Coupon & { email_allowlist?: string[] }).email_allowlist ?? [];
  if (allowlist.length > 0 && customerEmail) {
    const em = customerEmail.trim().toLowerCase();
    if (!allowlist.map((e) => e.toLowerCase()).includes(em)) {
      return { valid: false, error: 'This coupon is not valid for your email address' };
    }
  } else if (allowlist.length > 0 && !customerEmail) {
    return { valid: false, error: 'Sign in or enter email to use this coupon' };
  }

  const productAllow = (coupon as Coupon & { product_ids?: string[] }).product_ids ?? [];
  if (productAllow.length > 0 && items && items.length > 0) {
    const slugs = lineSlugs(items);
    const allowed = new Set(productAllow.map((s) => s.toLowerCase()));
    const ok = slugs.every((s) => allowed.has(s.toLowerCase()));
    if (!ok) {
      return { valid: false, error: 'This coupon does not apply to items in your cart' };
    }
  }

  const categoryAllow = (coupon as Coupon & { category_slugs?: string[] }).category_slugs ?? [];
  if (categoryAllow.length > 0 && items && items.length > 0) {
    const cats = new Set(categoryAllow.map((c) => c.toLowerCase()));
    for (const item of items) {
      const slug = String(item.product_id ?? '').split('::')[0];
      if (!slug) continue;
      const product = await getCatalogProductBySlug(slug);
      const cat = (product?.category ?? '').toLowerCase();
      if (!cat || !cats.has(cat)) {
        return { valid: false, error: 'This coupon does not apply to these products' };
      }
    }
  }

  let discount: number;
  if (coupon.discount_type === 'percentage') {
    discount = Math.round(subtotal * (coupon.discount_value / 100) * 100) / 100;
    if (coupon.max_discount_amount !== null) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }
  } else {
    discount = Math.min(coupon.discount_value, subtotal);
  }

  discount = Math.round(discount * 100) / 100;
  if (discount <= 0) return { valid: false, error: 'No discount applicable' };

  return { valid: true, coupon: coupon as Coupon, discount };
}

/**
 * Record coupon usage after a successful order and increment `times_used`.
 */
export async function recordCouponUsage(
  couponId: string,
  orderId: string,
  userId: string | null,
  customerEmail: string | null
) {
  const service = createServiceClient();
  const supabase = service ?? (await createClient());

  await supabase.from('coupon_usages').insert({
    coupon_id: couponId,
    order_id: orderId,
    user_id: userId ?? undefined,
    customer_email: customerEmail ?? undefined,
  });

  await supabase.rpc('increment_coupon_times_used', { p_coupon_id: couponId });
}

async function countUserUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  couponId: string,
  userId: string | null,
  customerEmail: string | null
): Promise<number> {
  if (!userId && !customerEmail) return 0;

  let query = supabase
    .from('coupon_usages')
    .select('id', { count: 'exact', head: true })
    .eq('coupon_id', couponId);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (customerEmail) {
    query = query.eq('customer_email', customerEmail);
  }

  const { count } = await query;
  return count ?? 0;
}
