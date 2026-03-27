import { NextResponse } from 'next/server';
import { upsertAbandonedCart } from '@/lib/emailAutomation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const cart = await upsertAbandonedCart({
    email,
    userId: typeof body.user_id === 'string' ? body.user_id : null,
    items: Array.isArray(body.items) ? body.items : [],
    subtotalAmount: Number(body.subtotal_amount ?? 0),
    couponCode: typeof body.coupon_code === 'string' ? body.coupon_code : null,
    paymentChoice: typeof body.payment_choice === 'string' ? body.payment_choice : null,
    marketingOptIn: !!body.marketing_opt_in,
    metadata: typeof body.metadata === 'object' && body.metadata ? body.metadata : {},
  });

  return NextResponse.json({ ok: true, cart });
}

