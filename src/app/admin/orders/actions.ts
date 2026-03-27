'use server';

import { revalidatePath } from 'next/cache';
import { appendOrderTimeline, writeAuditLog } from '@/lib/audit';
import { triggerEmail } from '@/lib/email';
import { ORDER_STATUSES, REVERSE_STOCK_STATUSES, isOrderStatus } from '@/lib/orders';
import { requireAdminPage } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';
import type { Order, OrderItem, OrderStatus } from '@/types/database';

function normalizeNullableString(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseMoneyValue(value: FormDataEntryValue | null) {
  const amount = Number(typeof value === 'string' ? value : 0);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function parseAddress(formData: FormData, prefix: string) {
  return {
    line1: normalizeNullableString(formData.get(`${prefix}_line1`)) ?? '',
    line2: normalizeNullableString(formData.get(`${prefix}_line2`)) ?? '',
    city: normalizeNullableString(formData.get(`${prefix}_city`)) ?? '',
    state: normalizeNullableString(formData.get(`${prefix}_state`)) ?? '',
    postal_code: normalizeNullableString(formData.get(`${prefix}_postal_code`)) ?? '',
    country: normalizeNullableString(formData.get(`${prefix}_country`)) ?? 'US',
  };
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? '';
}

function getStatusEmailEvent(status: OrderStatus) {
  const customerEventByStatus: Partial<Record<OrderStatus, string>> = {
    Processing: 'order_received',
    'On Hold': 'order_on_hold',
    Completed: 'order_completed',
    Cancelled: 'order_cancelled',
    Refunded: 'order_refunded',
    Failed: 'order_payment_failed',
  };

  return customerEventByStatus[status];
}

async function fetchOrder(orderId: string) {
  const supabase = await createClient();
  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
  return { supabase, order: order as Order | null };
}

async function reverseLegacyInventoryIfNeeded(order: Order, nextStatus: OrderStatus) {
  const previousStatus = order.status;
  const wasReversible = previousStatus && !REVERSE_STOCK_STATUSES.includes(previousStatus);
  if (!REVERSE_STOCK_STATUSES.includes(nextStatus) || !wasReversible) {
    return;
  }

  const supabase = await createClient();
  const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
  for (const item of items) {
    const productId = item.product_id ?? '';
    if (!productId || productId.includes('::')) {
      continue;
    }

    try {
      await supabase.rpc('increment_product_stock', {
        p_product_id: productId,
        p_delta: item.quantity ?? 1,
      });
    } catch {
      // Variant catalog inventory is managed separately from the legacy products table.
    }
  }
}

function revalidateOrders(orderId: string) {
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminPage({ action: 'write', resource: 'orders' });

  const orderId = normalizeNullableString(formData.get('order_id'));
  const nextStatus = normalizeNullableString(formData.get('status'));

  if (!orderId || !nextStatus || !isOrderStatus(nextStatus) || !ORDER_STATUSES.includes(nextStatus)) {
    return;
  }

  const { supabase, order } = await fetchOrder(orderId);
  if (!order || order.status === nextStatus) {
    return;
  }

  await reverseLegacyInventoryIfNeeded(order, nextStatus);

  const updates: Partial<Order> = { status: nextStatus };
  const now = new Date().toISOString();
  if (nextStatus === 'Completed') updates.fulfilled_at = order.fulfilled_at ?? now;
  if (nextStatus === 'Refunded') updates.refunded_at = order.refunded_at ?? now;

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
  if (error) {
    throw new Error(error.message);
  }

  await appendOrderTimeline({
    orderId,
    entryType: 'system',
    message: `Order status changed from ${order.status} to ${nextStatus}.`,
    metadata: { previous_status: order.status, status: nextStatus },
  });

  await writeAuditLog({
    action: 'update_status',
    resourceType: 'order',
    resourceId: orderId,
    oldData: { status: order.status },
    newData: updates,
  });

  const baseUrl = getBaseUrl();
  const customerEmail = order.customer_email?.trim();
  if (baseUrl && customerEmail) {
    const payload = {
      order_id: orderId,
      customer_email: customerEmail,
      total_amount: order.total_amount,
      items: order.items,
      previous_status: order.status,
    };
    const customerEvent = getStatusEmailEvent(nextStatus);
    if (customerEvent) {
      void triggerEmail(baseUrl, customerEvent, payload);
    }
    if (nextStatus === 'Completed') {
      void triggerEmail(baseUrl, 'review_reminder', payload);
    }
    if (nextStatus === 'Failed') void triggerEmail(baseUrl, 'admin_payment_failed', payload);
    if (nextStatus === 'Cancelled') void triggerEmail(baseUrl, 'admin_order_cancelled', payload);
    if (nextStatus === 'Refunded') void triggerEmail(baseUrl, 'admin_order_refunded', payload);
  }

  revalidateOrders(orderId);
}

export async function bulkUpdateOrderStatusAction(formData: FormData) {
  await requireAdminPage({ action: 'write', resource: 'orders' });

  const nextStatus = normalizeNullableString(formData.get('status'));
  const orderIds = formData
    .getAll('order_ids')
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);

  if (!nextStatus || !isOrderStatus(nextStatus) || orderIds.length === 0) {
    return;
  }

  for (const orderId of orderIds) {
    const childFormData = new FormData();
    childFormData.set('order_id', orderId);
    childFormData.set('status', nextStatus);
    await updateOrderStatusAction(childFormData);
  }
}

export async function updateTrackingAction(formData: FormData) {
  await requireAdminPage({ action: 'write', resource: 'orders' });

  const orderId = normalizeNullableString(formData.get('order_id'));
  if (!orderId) {
    return;
  }

  const trackingId = normalizeNullableString(formData.get('tracking_id'));
  const { supabase, order } = await fetchOrder(orderId);
  if (!order) {
    return;
  }

  const updates: Partial<Order> = {
    tracking_id: trackingId,
    fulfilled_at: trackingId ? order.fulfilled_at ?? new Date().toISOString() : order.fulfilled_at ?? null,
  };

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
  if (error) {
    throw new Error(error.message);
  }

  await appendOrderTimeline({
    orderId,
    entryType: 'system',
    message: trackingId
      ? `Tracking number saved: ${trackingId}.`
      : 'Tracking number cleared.',
    metadata: { tracking_id: trackingId },
  });

  await writeAuditLog({
    action: 'update_tracking',
    resourceType: 'order',
    resourceId: orderId,
    oldData: { tracking_id: order.tracking_id },
    newData: updates,
  });

  const baseUrl = getBaseUrl();
  const customerEmail = order.customer_email?.trim();
  if (baseUrl && customerEmail && trackingId) {
    void triggerEmail(baseUrl, 'order_shipped', {
      order_id: orderId,
      customer_email: customerEmail,
      tracking_id: trackingId,
    });
  }

  revalidateOrders(orderId);
}

export async function updateOrderGeneralAction(formData: FormData) {
  await requireAdminPage({ action: 'write', resource: 'orders' });

  const orderId = normalizeNullableString(formData.get('order_id'));
  if (!orderId) {
    return;
  }

  const { supabase, order } = await fetchOrder(orderId);
  if (!order) {
    return;
  }

  const updates: Partial<Order> = {
    customer_email: normalizeNullableString(formData.get('customer_email')),
    payment_method: normalizeNullableString(formData.get('payment_method')),
    payment_reference: normalizeNullableString(formData.get('payment_reference')),
    payment_gateway: normalizeNullableString(formData.get('payment_gateway')),
    attribution_source: normalizeNullableString(formData.get('attribution_source')),
    attribution_detail: normalizeNullableString(formData.get('attribution_detail')),
    crypto_txid: normalizeNullableString(formData.get('crypto_txid')),
    coupon_code: normalizeNullableString(formData.get('coupon_code')),
    subtotal_amount: parseMoneyValue(formData.get('subtotal_amount')),
    shipping_amount: parseMoneyValue(formData.get('shipping_amount')),
    tax_amount: parseMoneyValue(formData.get('tax_amount')),
    discount_amount: parseMoneyValue(formData.get('discount_amount')),
  };

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
  if (error) {
    throw new Error(error.message);
  }

  await appendOrderTimeline({
    orderId,
    entryType: 'system',
    message: 'General order details were updated.',
    metadata: updates as Record<string, unknown>,
  });

  await writeAuditLog({
    action: 'update_general',
    resourceType: 'order',
    resourceId: orderId,
    oldData: {
      customer_email: order.customer_email,
      payment_method: order.payment_method,
      payment_reference: order.payment_reference,
      payment_gateway: order.payment_gateway,
      attribution_source: order.attribution_source,
      attribution_detail: order.attribution_detail,
      crypto_txid: order.crypto_txid,
      coupon_code: order.coupon_code,
      subtotal_amount: order.subtotal_amount,
      shipping_amount: order.shipping_amount,
      tax_amount: order.tax_amount,
      discount_amount: order.discount_amount,
    },
    newData: updates,
  });

  revalidateOrders(orderId);
}

export async function updateOrderAddressesAction(formData: FormData) {
  await requireAdminPage({ action: 'write', resource: 'orders' });

  const orderId = normalizeNullableString(formData.get('order_id'));
  const section = normalizeNullableString(formData.get('section'));
  if (!orderId || !section || !['billing', 'shipping'].includes(section)) {
    return;
  }

  const { supabase, order } = await fetchOrder(orderId);
  if (!order) {
    return;
  }

  const address = parseAddress(formData, section);
  const field = section === 'billing' ? 'billing_address' : 'shipping_address';
  const updates = { [field]: address };

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
  if (error) {
    throw new Error(error.message);
  }

  await appendOrderTimeline({
    orderId,
    entryType: 'system',
    message: `${section === 'billing' ? 'Billing' : 'Shipping'} address updated.`,
    metadata: address,
  });

  await writeAuditLog({
    action: `update_${section}_address`,
    resourceType: 'order',
    resourceId: orderId,
    oldData: field === 'billing_address' ? order.billing_address : order.shipping_address,
    newData: address,
  });

  revalidateOrders(orderId);
}

export async function addOrderNoteAction(formData: FormData) {
  await requireAdminPage({ action: 'write', resource: 'orders' });

  const orderId = normalizeNullableString(formData.get('order_id'));
  const message = normalizeNullableString(formData.get('message'));
  const isPrivate = formData.get('is_private') === 'true';

  if (!orderId || !message) {
    return;
  }

  await appendOrderTimeline({
    orderId,
    entryType: 'note',
    message,
    isPrivate,
  });

  await writeAuditLog({
    action: 'add_note',
    resourceType: 'order',
    resourceId: orderId,
    newData: { message, is_private: isPrivate },
  });

  revalidateOrders(orderId);
}
