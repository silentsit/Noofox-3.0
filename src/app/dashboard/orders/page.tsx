import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-surface-900">Order history</h1>
      <p className="mt-1 text-surface-500">
        View status, tracking ID, and details for all your orders.
      </p>

      {!orders?.length ? (
        <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-12 text-center">
          <p className="text-surface-500">You haven’t placed any orders yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block font-medium text-brand-600 hover:text-brand-700"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                    Tracking ID
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-50">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-surface-900 sm:px-6">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-surface-500 sm:px-6">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-surface-500 sm:px-6">
                      {order.status}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-mono text-sm text-surface-500 sm:px-6">
                      {order.tracking_id ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-surface-900 sm:px-6">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
