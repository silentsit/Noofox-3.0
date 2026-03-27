import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  appendGuardarianTimeline,
  isGuardarianWebhookAuthorized,
  mapGuardarianToOrderTransition,
  normalizeGuardarianWebhookPayload,
  shouldApplyTransition,
} from '@/lib/guardarian';

function eventKey(input: {
  eventId: string | null;
  txId: string | null;
  orderId: string | null;
  status: string;
  payload: unknown;
}) {
  if (input.eventId) return `event:${input.eventId}`;
  return `tx:${input.txId ?? 'unknown'}:order:${input.orderId ?? 'unknown'}:status:${input.status}:${JSON.stringify(input.payload)}`;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  let payload: unknown = {};
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!isGuardarianWebhookAuthorized(request, rawBody)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const normalized = normalizeGuardarianWebhookPayload(payload);
  if (!normalized.orderId) {
    return NextResponse.json({ error: 'Missing external partner order id' }, { status: 400 });
  }

  const svc = createServiceClient();
  if (!svc) {
    return NextResponse.json({ error: 'Service client unavailable' }, { status: 500 });
  }

  const transactionPayload = {
    order_id: normalized.orderId,
    guardarian_tx_id: normalized.txId,
    external_partner_link_id: normalized.orderId,
    status: normalized.status,
    from_currency: normalized.fromCurrency,
    to_currency: normalized.toCurrency,
    fiat_amount: normalized.fiatAmount,
    crypto_amount: normalized.cryptoAmount,
    destination_address: normalized.destinationAddress,
    tx_hash: normalized.txHash,
    payment_reference: normalized.paymentReference,
    raw_payload: payload,
    last_event_at: new Date().toISOString(),
  };

  const { data: upsertedTx, error: txError } = await svc
    .from('guardarian_transactions')
    .upsert(transactionPayload, { onConflict: 'order_id' })
    .select('id')
    .single();

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 400 });
  }

  const key = eventKey({
    eventId: normalized.eventId,
    txId: normalized.txId,
    orderId: normalized.orderId,
    status: normalized.status,
    payload,
  });

  const { data: insertedEvent, error: eventError } = await svc
    .from('guardarian_events')
    .insert({
      order_id: normalized.orderId,
      transaction_id: upsertedTx?.id ?? null,
      event_key: key,
      event_id: normalized.eventId,
      status: normalized.status,
      payload,
    })
    .select('id')
    .maybeSingle();

  if (eventError) {
    if (eventError.code === '23505') {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: eventError.message }, { status: 400 });
  }

  if (!insertedEvent) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const transition = mapGuardarianToOrderTransition(normalized.status);
  const { data: order } = await svc
    .from('orders')
    .select('id, status, payment_metadata')
    .eq('id', normalized.orderId)
    .single();

  if (!order) {
    return NextResponse.json({ ok: true, warning: 'order_not_found' });
  }

  const updates: Record<string, unknown> = {
    payment_gateway: 'guardarian',
    payment_reference: normalized.paymentReference ?? normalized.txId ?? null,
    crypto_txid: normalized.txHash ?? null,
    payment_metadata: {
      ...(typeof order.payment_metadata === 'object' && order.payment_metadata ? order.payment_metadata : {}),
      guardarian: {
        tx_id: normalized.txId,
        status: normalized.status,
        from_currency: normalized.fromCurrency,
        to_currency: normalized.toCurrency,
        fiat_amount: normalized.fiatAmount,
        crypto_amount: normalized.cryptoAmount,
        tx_hash: normalized.txHash,
        destination_address: normalized.destinationAddress,
        updated_at: new Date().toISOString(),
      },
    },
  };

  if (shouldApplyTransition(order.status, transition.nextStatus)) {
    updates.status = transition.nextStatus;
    if (transition.nextStatus === 'Processing') updates.paid_at = new Date().toISOString();
    if (transition.nextStatus === 'Refunded') updates.refunded_at = new Date().toISOString();
  }

  const { error: orderUpdateError } = await svc.from('orders').update(updates).eq('id', normalized.orderId);
  if (orderUpdateError) {
    return NextResponse.json({ error: orderUpdateError.message }, { status: 400 });
  }

  if (transition.timelineMessage) {
    await appendGuardarianTimeline(normalized.orderId, transition.timelineMessage, {
      provider: 'guardarian',
      status: normalized.status,
      transaction_id: normalized.txId,
      tx_hash: normalized.txHash,
      event_id: normalized.eventId,
    });
  }

  return NextResponse.json({ ok: true });
}
