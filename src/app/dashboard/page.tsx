import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users')
    .select('email, role, profile_data')
    .eq('id', user?.id ?? '')
    .single();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_amount, tracking_id, created_at')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(5);

  const currentOrder = orders?.[0];
  const fullName =
    (profile?.profile_data as { full_name?: string } | null)?.full_name ?? '';

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Dashboard</h1>
        <p className="mt-1 text-surface-600">
          Welcome back{fullName ? `, ${fullName}` : ''}.
        </p>
      </div>

      <section
        className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm"
        aria-labelledby="current-order-heading"
      >
        <h2 id="current-order-heading" className="text-lg font-semibold text-surface-900">
          Current order status
        </h2>
        {currentOrder ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-surface-500">Status</p>
              <p className="font-medium text-surface-900">{currentOrder.status}</p>
            </div>
            <div>
              <p className="text-sm text-surface-500">Tracking ID</p>
              <p className="font-medium text-surface-900 font-mono">
                {currentOrder.tracking_id ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-surface-500">Total</p>
              <p className="font-medium text-surface-900">
                ${Number(currentOrder.total_amount).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-surface-500">Date</p>
              <p className="font-medium text-surface-900">
                {new Date(currentOrder.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-surface-600">No orders yet.</p>
        )}
        <Link
          href="/dashboard/orders"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View order history →
        </Link>
      </section>

      <section
        className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm"
        aria-labelledby="order-history-heading"
      >
        <h2 id="order-history-heading" className="text-lg font-semibold text-surface-900">
          Recent orders
        </h2>
        {orders && orders.length > 0 ? (
          <ul className="mt-4 divide-y divide-surface-200">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between py-4 first:pt-0">
                <div>
                  <p className="font-medium text-surface-900">{order.id.slice(0, 8)}…</p>
                  <p className="text-sm text-surface-500">{order.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-surface-900">
                    ${Number(order.total_amount).toFixed(2)}
                  </p>
                  <Link
                    href={`/dashboard/orders?highlight=${order.id}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-surface-600">No orders yet.</p>
        )}
        <Link
          href="/dashboard/orders"
          className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View all orders →
        </Link>
      </section>

      <section
        className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm"
        aria-labelledby="profile-heading"
      >
        <h2 id="profile-heading" className="text-lg font-semibold text-surface-900">
          Profile & shipping
        </h2>
        <p className="mt-2 text-surface-600">
          Edit your profile and default shipping address.
        </p>
        <Link
          href="/dashboard/profile"
          className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Edit profile
        </Link>
      </section>
    </div>
  );
}
