import { createClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/types/database';
import { triggerEmail } from '@/lib/email';

const STATUSES: OrderStatus[] = [
  'Pending Payment',
  'Processing',
  'On Hold',
  'Completed',
  'Cancelled',
  'Refunded',
  'Failed',
];

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

const REVERSE_STOCK_STATUSES: OrderStatus[] = ['Cancelled', 'Refunded', 'Failed'];

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  async function updateStatus(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const status = formData.get('status') as OrderStatus;
    if (!STATUSES.includes(status)) return;

    const { data: order } = await supabase
      .from('orders')
      .select('items, status, customer_email, total_amount')
      .eq('id', orderId)
      .single();

    const previousStatus = order?.status as OrderStatus | undefined;
    const wasReversible = previousStatus && !REVERSE_STOCK_STATUSES.includes(previousStatus);
    if (order && REVERSE_STOCK_STATUSES.includes(status) && wasReversible) {
      const items = (order.items as { product_id: string; quantity: number }[]) ?? [];
      for (const item of items) {
        await supabase.rpc('increment_product_stock', {
          p_product_id: item.product_id,
          p_delta: item.quantity ?? 1,
        });
      }
    }

    await supabase.from('orders').update({ status }).eq('id', orderId);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const customerEmail = (order as { customer_email?: string }).customer_email?.trim();
    const totalAmount = (order as { total_amount?: number }).total_amount ?? 0;
    const payload = {
      order_id: orderId,
      customer_email: customerEmail ?? undefined,
      total_amount: totalAmount,
      items: order?.items ?? [],
      previous_status: previousStatus,
    };

    if (baseUrl) {
      const customerEventByStatus: Partial<Record<OrderStatus, string>> = {
        'Processing': 'order_received',
        'On Hold': 'order_on_hold',
        'Completed': 'order_completed',
        'Cancelled': 'order_cancelled',
        'Refunded': 'order_refunded',
        'Failed': 'order_payment_failed',
      };
      const customerEvent = customerEventByStatus[status];
      if (customerEvent) void triggerEmail(baseUrl, customerEvent, payload);
      if (status === 'Failed') void triggerEmail(baseUrl, 'admin_payment_failed', payload);
      if (status === 'Cancelled') void triggerEmail(baseUrl, 'admin_order_cancelled', payload);
      if (status === 'Refunded') void triggerEmail(baseUrl, 'admin_order_refunded', payload);
    }
  }

  return (
    <form action={updateStatus} className="inline-block">
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded border border-surface-300 px-2 py-1 text-sm text-surface-900"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="ml-1 rounded bg-surface-200 px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-300"
      >
        Update
      </button>
    </form>
  );
}
