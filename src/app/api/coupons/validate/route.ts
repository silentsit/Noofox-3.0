import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';
import { createClient } from '@/lib/supabase/server';
import type { OrderItem } from '@/types/database';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { coupon_code, subtotal, items } = body as {
    coupon_code?: string;
    subtotal?: number;
    items?: OrderItem[];
  };

  if (!coupon_code || subtotal == null) {
    return NextResponse.json(
      { valid: false, error: 'coupon_code and subtotal are required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const result = await validateCoupon(
    coupon_code,
    Number(subtotal),
    user?.id ?? null,
    user?.email ?? null,
    Array.isArray(items) ? items : undefined
  );

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error });
  }

  return NextResponse.json({
    valid: true,
    discount: result.discount,
    discount_type: result.coupon.discount_type,
    discount_value: result.coupon.discount_value,
    code: result.coupon.code,
  });
}
