import { createHash, timingSafeEqual } from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';

type GuardarianOrderContext = {
  orderId: string;
  customerEmail?: string | null;
  amountUsd: number;
};

type Transition = {
  nextStatus: 'Pending Payment' | 'Processing' | 'On Hold' | 'Cancelled' | 'Refunded' | 'Failed' | null;
  timelineMessage: string | null;
};

const DEFAULT_GUARDRIAN_BASE_URL = 'https://guardarian.com/buy-crypto-with-card';

function firstString(input: unknown, keys: string[]): string | null {
  if (!input || typeof input !== 'object') return null;
  const rec = input as Record<string, unknown>;
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function firstNumber(input: unknown, keys: string[]): number | null {
  if (!input || typeof input !== 'object') return null;
  const rec = input as Record<string, unknown>;
  for (const key of keys) {
    const value = rec[key];
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function normalizeGuardarianStatus(raw: string | null | undefined): string {
  const value = String(raw ?? '').trim().toLowerCase();
  return value || 'new';
}

export function mapGuardarianToOrderTransition(rawStatus: string | null | undefined): Transition {
  const status = normalizeGuardarianStatus(rawStatus);
  if (['finished', 'completed', 'done', 'success', 'paid'].includes(status)) {
    return {
      nextStatus: 'Processing',
      timelineMessage: 'Guardarian marked payment as finished. Funds received; order moved to Processing.',
    };
  }
  if (['refunded', 'chargeback'].includes(status)) {
    return {
      nextStatus: 'Refunded',
      timelineMessage: 'Guardarian marked payment as refunded.',
    };
  }
  if (['failed', 'declined', 'error'].includes(status)) {
    return {
      nextStatus: 'Failed',
      timelineMessage: 'Guardarian marked payment as failed.',
    };
  }
  if (['cancelled', 'canceled'].includes(status)) {
    return {
      nextStatus: 'Cancelled',
      timelineMessage: 'Guardarian marked payment as cancelled.',
    };
  }
  if (['expired', 'timeout'].includes(status)) {
    return {
      nextStatus: 'Failed',
      timelineMessage: 'Guardarian marked payment session as expired.',
    };
  }
  if (['pending', 'new', 'created', 'waiting_payment', 'waiting'].includes(status)) {
    return {
      nextStatus: 'Pending Payment',
      timelineMessage: 'Guardarian payment session created and pending completion.',
    };
  }
  return { nextStatus: null, timelineMessage: null };
}

export function shouldApplyTransition(current: string, next: Transition['nextStatus']) {
  if (!next) return false;
  if (current === next) return false;
  if (current === 'Completed') return false;
  if (next === 'Pending Payment') return current === 'Pending Payment';
  if (next === 'Processing') return ['Pending Payment', 'On Hold', 'Failed'].includes(current);
  if (next === 'Refunded') return ['Processing', 'Completed', 'On Hold'].includes(current);
  if (next === 'Failed') return ['Pending Payment', 'On Hold'].includes(current);
  if (next === 'Cancelled') return ['Pending Payment', 'On Hold'].includes(current);
  return true;
}

export function buildGuardarianCheckoutUrl(ctx: GuardarianOrderContext): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_GUARDARIAN_BASE_URL?.trim() ||
    process.env.GUARDARIAN_BASE_URL?.trim() ||
    DEFAULT_GUARDRIAN_BASE_URL;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const returnUrl = siteUrl
    ? `${siteUrl.replace(/\/$/, '')}/checkout/success?orderId=${encodeURIComponent(ctx.orderId)}&method=pay_card`
    : undefined;

  const params = new URLSearchParams();
  const partnerApiToken = process.env.GUARDARIAN_PARTNER_API_TOKEN?.trim();
  const partnerId = process.env.GUARDARIAN_PARTNER_ID?.trim();
  const defaultFiat = process.env.GUARDARIAN_DEFAULT_FIAT?.trim() || 'USD';
  const defaultCrypto = process.env.GUARDARIAN_DEFAULT_CRYPTO?.trim() || 'USDT';
  const destinationAddress = process.env.GUARDARIAN_DESTINATION_ADDRESS?.trim();

  if (partnerApiToken) params.set('partner_api_token', partnerApiToken);
  if (partnerId) params.set('partner_id', partnerId);

  params.set('external_partner_link_id', ctx.orderId);
  params.set('from_currency', defaultFiat);
  params.set('to_currency', defaultCrypto);
  params.set('from_amount', String(Math.max(0, Math.round(ctx.amountUsd * 100) / 100)));

  if (ctx.customerEmail) params.set('email', ctx.customerEmail);
  if (destinationAddress) params.set('address', destinationAddress);
  if (returnUrl) {
    params.set('return_url', returnUrl);
    params.set('redirect_url', returnUrl);
  }

  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
}

export function isGuardarianWebhookAuthorized(request: Request, rawBody: string): boolean {
  const webhookSecret = process.env.GUARDARIAN_WEBHOOK_SECRET?.trim();
  const webhookSignatureSecret = process.env.GUARDARIAN_WEBHOOK_SIGNATURE_SECRET?.trim();

  if (!webhookSecret && !webhookSignatureSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  if (webhookSecret) {
    const directSecret =
      request.headers.get('x-guardarian-webhook-secret') ??
      request.headers.get('x-webhook-secret') ??
      request.headers.get('x-api-key');
    if (directSecret && directSecret === webhookSecret) return true;

    const auth = request.headers.get('authorization') ?? '';
    if (auth.startsWith('Bearer ') && auth.slice(7).trim() === webhookSecret) return true;
  }

  if (webhookSignatureSecret) {
    const signature = request.headers.get('x-guardarian-signature') ?? '';
    if (!signature) return false;
    const digest = createHash('sha256').update(`${webhookSignatureSecret}.${rawBody}`).digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(digest);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }

  return false;
}

export type GuardarianWebhookNormalized = {
  orderId: string | null;
  eventId: string | null;
  txId: string | null;
  status: string;
  txHash: string | null;
  paymentReference: string | null;
  fromCurrency: string | null;
  toCurrency: string | null;
  fiatAmount: number | null;
  cryptoAmount: number | null;
  destinationAddress: string | null;
};

export function normalizeGuardarianWebhookPayload(payload: unknown): GuardarianWebhookNormalized {
  const orderId = firstString(payload, [
    'external_partner_link_id',
    'externalPartnerLinkId',
    'partner_external_id',
    'partnerExternalId',
    'merchant_order_id',
    'merchantOrderId',
    'order_id',
    'orderId',
  ]);

  const eventId = firstString(payload, ['event_id', 'eventId', 'id']);
  const txId = firstString(payload, ['transaction_id', 'transactionId', 'exchange_id', 'exchangeId', 'id']);
  const status = normalizeGuardarianStatus(
    firstString(payload, ['status', 'transaction_status', 'transactionStatus', 'state'])
  );

  return {
    orderId,
    eventId,
    txId,
    status,
    txHash: firstString(payload, ['tx_hash', 'txHash', 'hash', 'blockchain_tx_hash']),
    paymentReference: firstString(payload, ['payment_reference', 'paymentReference', 'reference']),
    fromCurrency: firstString(payload, ['from_currency', 'fromCurrency', 'fiat_currency', 'fiatCurrency']),
    toCurrency: firstString(payload, ['to_currency', 'toCurrency', 'crypto_currency', 'cryptoCurrency']),
    fiatAmount: firstNumber(payload, ['from_amount', 'fromAmount', 'fiat_amount', 'fiatAmount']),
    cryptoAmount: firstNumber(payload, ['to_amount', 'toAmount', 'crypto_amount', 'cryptoAmount']),
    destinationAddress: firstString(payload, ['address', 'wallet_address', 'walletAddress', 'destination_address']),
  };
}

export async function appendGuardarianTimeline(orderId: string, message: string, metadata: Record<string, unknown>) {
  const svc = createServiceClient();
  if (!svc) return;
  await svc.rpc('append_order_timeline', {
    p_order_id: orderId,
    p_entry_type: 'system',
    p_message: message,
    p_is_private: false,
    p_actor_id: null,
    p_metadata: metadata,
  });
}
