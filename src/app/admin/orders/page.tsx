import { createClient } from '@/lib/supabase/server';
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect';
import { triggerEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-surface-900">Order management</h1>
      <p className="mt-1 text-surface-500">
        Update status and tracking ID for all orders.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Tracking ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white">
              {(orders ?? []).map((order) => (
                <tr key={order.id} className="hover:bg-surface-50">
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-sm text-surface-900 sm:px-6">
                    {order.id.slice(0, 8)}…
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-surface-500 sm:px-6">
                    {(order as { customer_email?: string }).customer_email ?? (order.user_id ? order.user_id.slice(0, 8) + '…' : 'Guest')}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                    <TrackingIdInput orderId={order.id} value={order.tracking_id} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-surface-900 sm:px-6">
                    ${Number(order.total_amount).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-surface-500 sm:px-6">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!orders || orders.length === 0) && (
          <div className="px-6 py-12 text-center text-surface-500">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}

function TrackingIdInput({ orderId, value }: { orderId: string; value: string | null }) {
  async function updateTracking(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const trackingId = (formData.get('tracking_id') as string)?.trim() ?? null;
    const { data: order } = await supabase
      .from('orders')
      .update({ tracking_id: trackingId })
      .eq('id', orderId)
      .select('customer_email')
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const customerEmail = (order as { customer_email?: string } | null)?.customer_email?.trim();
    if (baseUrl && customerEmail && trackingId) {
      void triggerEmail(baseUrl, 'order_shipped', {
        order_id: orderId,
        customer_email: customerEmail,
        tracking_id: trackingId,
      });
    }
  }
  return (
    <form action={updateTracking} className="flex gap-1"
    >
      <input
        type="text"
        name="tracking_id"
        defaultValue={value ?? ''}
        placeholder="Tracking ID"
        className="w-32 rounded border border-surface-300 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        className="rounded bg-surface-100 px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-100"
      >
        Save
      </button>
    </form>
  );
}
