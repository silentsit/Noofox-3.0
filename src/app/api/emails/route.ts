import { NextResponse } from 'next/server';
import { getAdminEmails } from '@/lib/email';
import type { EmailPayload } from '@/lib/email';

/**
 * Placeholder: wire to Resend, SendGrid, or Supabase Edge Function.
 * Returns true if send would succeed (for now we only log).
 */
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  // TODO: e.g. await resend.emails.send({ from, to, subject, html: body });
  console.log('[emails]', { to: to.slice(0, 20) + '…', subject });
  return true;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { event, payload } = body as { event?: string; payload?: EmailPayload };

  if (!event || !payload) {
    return NextResponse.json({ error: 'event and payload required' }, { status: 400 });
  }

  let sent = false;
  let error: string | null = null;

  const orderId = payload.order_id ?? '';
  const shortId = typeof orderId === 'string' ? orderId.slice(0, 8) : '';
  const customerEmail = (payload.customer_email as string)?.trim() || '';
  const totalAmount = payload.total_amount != null ? Number(payload.total_amount) : 0;
  const trackingId = (payload.tracking_id as string) ?? '';

  switch (event) {
    case 'order_placed': {
      if (customerEmail) {
        const subject = `Order received #${shortId} – Complete payment`;
        const body = `We received your order #${shortId}. Complete payment to continue.`;
        sent = await sendEmail(customerEmail, subject, body);
      }
      break;
    }
    case 'order_received': {
      if (customerEmail) {
        const subject = `Payment received – Order #${shortId}`;
        const body = `Payment received. We're preparing your order #${shortId}.`;
        sent = await sendEmail(customerEmail, subject, body);
      }
      break;
    }
    case 'order_on_hold': {
      if (customerEmail) {
        const subject = `Order #${shortId} on hold`;
        const body = `Your order #${shortId} is on hold. We'll contact you if we need anything.`;
        sent = await sendEmail(customerEmail, subject, body);
      }
      break;
    }
    case 'order_shipped': {
      if (customerEmail) {
        const subject = `Your order #${shortId} has shipped`;
        const body = trackingId
          ? `Your order has shipped. Track it here: ${trackingId}.`
          : `Your order #${shortId} has shipped.`;
        sent = await sendEmail(customerEmail, subject, body);
      }
      break;
    }
    case 'order_completed': {
      if (customerEmail) {
        const subject = `Order #${shortId} complete`;
        const body = `Your order #${shortId} is complete. Thank you for shopping with us.`;
        sent = await sendEmail(customerEmail, subject, body);
      }
      break;
    }
    case 'order_cancelled': {
      if (customerEmail) {
        const subject = `Order #${shortId} cancelled`;
        const body = `Your order #${shortId} has been cancelled.`;
        sent = await sendEmail(customerEmail, subject, body);
      }
      break;
    }
    case 'order_refunded': {
      if (customerEmail) {
        const subject = `Refund processed – Order #${shortId}`;
        const body = `Your refund for order #${shortId} has been processed.`;
        sent = await sendEmail(customerEmail, subject, body);
      }
      break;
    }
    case 'order_payment_failed': {
      if (customerEmail) {
        const subject = `Payment failed – Order #${shortId}`;
        const body = `Payment for order #${shortId} failed. Your cart is preserved—please try again.`;
        sent = await sendEmail(customerEmail, subject, body);
      }
      break;
    }
    case 'admin_new_order': {
      const admins = await getAdminEmails();
      const subject = `New order #${shortId} – $${totalAmount.toFixed(2)}`;
      const body = `New order #${shortId} – $${totalAmount.toFixed(2)} from ${customerEmail}. View in admin.`;
      for (const to of admins) {
        if (await sendEmail(to, subject, body)) sent = true;
      }
      break;
    }
    case 'admin_payment_failed': {
      const admins = await getAdminEmails();
      const subject = `Order #${shortId} payment failed`;
      const body = `Order #${shortId} payment failed. Customer: ${customerEmail}.`;
      for (const to of admins) {
        if (await sendEmail(to, subject, body)) sent = true;
      }
      break;
    }
    case 'admin_order_cancelled': {
      const admins = await getAdminEmails();
      const subject = `Order #${shortId} was cancelled`;
      const body = `Order #${shortId} was cancelled.`;
      for (const to of admins) {
        if (await sendEmail(to, subject, body)) sent = true;
      }
      break;
    }
    case 'admin_order_refunded': {
      const admins = await getAdminEmails();
      const subject = `Order #${shortId} was refunded`;
      const body = `Order #${shortId} was refunded.`;
      for (const to of admins) {
        if (await sendEmail(to, subject, body)) sent = true;
      }
      break;
    }
    case 'admin_high_value_order': {
      const admins = await getAdminEmails();
      const subject = `High-value order #${shortId} – review`;
      const body = `High-value order #${shortId} – $${totalAmount.toFixed(2)} from ${customerEmail}.`;
      for (const to of admins) {
        if (await sendEmail(to, subject, body)) sent = true;
      }
      break;
    }
    default:
      error = `Unknown event: ${event}`;
  }

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, sent });
}
