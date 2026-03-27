import Link from 'next/link';
import { bulkUpdateOrderStatusAction, updateOrderStatusAction } from '@/app/admin/orders/actions';
import { getOrderStatusClasses, ORDER_STATUS_TABS, formatAddressSnippet, formatMoney } from '@/lib/orders';
import { requireAdminPage } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';
import type { Order } from '@/types/database';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildStatusHref(current: URLSearchParams, status: string) {
  const next = new URLSearchParams(current);
  if (status === 'All') {
    next.delete('status');
  } else {
    next.set('status', status);
  }

  const query = next.toString();
  return query ? `/admin/orders?${query}` : '/admin/orders';
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPage({ action: 'read', resource: 'orders' });

  const resolvedParams = await searchParams;
  const q = getSingleParam(resolvedParams.q)?.trim() ?? '';
  const status = getSingleParam(resolvedParams.status)?.trim() ?? 'All';
  const from = getSingleParam(resolvedParams.from)?.trim() ?? '';
  const to = getSingleParam(resolvedParams.to)?.trim() ?? '';

  const supabase = await createClient();
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(150);

  if (status !== 'All') {
    query = query.eq('status', status);
  }

  if (q) {
    const escaped = q.replace(/[% ,]/g, ' ').trim().replace(/\s+/g, '%');
    query = query.or(
      `id.ilike.%${escaped}%,customer_email.ilike.%${escaped}%,tracking_id.ilike.%${escaped}%,payment_reference.ilike.%${escaped}%,crypto_txid.ilike.%${escaped}%`
    );
  }

  if (from) {
    query = query.gte('created_at', `${from}T00:00:00.000Z`);
  }

  if (to) {
    query = query.lte('created_at', `${to}T23:59:59.999Z`);
  }

  const { data: orders } = await query;
  const { data: statusRows } = await supabase.from('orders').select('status');
  const statusCounts = (statusRows ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  const currentFilters = new URLSearchParams();
  if (q) currentFilters.set('q', q);
  if (from) currentFilters.set('from', from);
  if (to) currentFilters.set('to', to);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Order management</h1>
          <p className="mt-1 text-surface-500">
            Dense fulfillment view with bulk status changes, payment tracing, and customer attribution.
          </p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-600">
          Showing {(orders ?? []).length} order{(orders ?? []).length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-200 bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-2">
          {ORDER_STATUS_TABS.map((tab) => {
            const isActive = status === tab.value;
            const count = tab.value === 'All'
              ? (statusRows ?? []).length
              : (statusCounts[tab.value] ?? 0);

            return (
              <Link
                key={tab.value}
                href={buildStatusHref(currentFilters, tab.value)}
                className={[
                  'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface-900 text-white'
                    : 'bg-surface-50 text-surface-600 hover:bg-surface-100 hover:text-surface-900',
                ].join(' ')}
              >
                {tab.label} <span className="text-xs opacity-75">({count})</span>
              </Link>
            );
          })}
        </div>
      </div>

      <form method="GET" className="grid gap-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm lg:grid-cols-[2fr,1fr,1fr,auto]">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search email, order ID, tracking number, crypto TXID"
          className="rounded-xl border border-surface-300 px-3 py-2 text-sm text-surface-900"
        />
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="rounded-xl border border-surface-300 px-3 py-2 text-sm text-surface-900"
        />
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="rounded-xl border border-surface-300 px-3 py-2 text-sm text-surface-900"
        />
        <div className="flex gap-2">
          {status !== 'All' && <input type="hidden" name="status" value={status} />}
          <button
            type="submit"
            className="rounded-xl bg-surface-900 px-4 py-2 text-sm font-medium text-white hover:bg-surface-800"
          >
            Apply filters
          </button>
          <Link
            href="/admin/orders"
            className="rounded-xl border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-surface-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-surface-900">Bulk actions</h2>
            <p className="text-sm text-surface-500">Select rows below to push status updates in one pass.</p>
          </div>
          <form
            id="bulk-orders-form"
            action={bulkUpdateOrderStatusAction}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <select
              name="status"
              defaultValue=""
              className="rounded-xl border border-surface-300 px-3 py-2 text-sm text-surface-900"
            >
              <option value="" disabled>
                Select bulk status
              </option>
              {ORDER_STATUS_TABS.filter((tab) => tab.value !== 'All').map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Apply to selected
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1200px] divide-y divide-surface-200">
            <thead className="bg-surface-50">
              <tr className="text-left text-xs uppercase tracking-[0.16em] text-surface-500">
                <th className="px-4 py-3">Bulk</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3">Shipping</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Attribution</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {(orders as Order[] | null)?.map((order) => (
                <tr key={order.id} className="align-top hover:bg-surface-50/80">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      name="order_ids"
                      value={order.id}
                      form="bulk-orders-form"
                      className="h-4 w-4 rounded border-surface-300 text-brand-600"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-mono text-sm text-surface-900">{order.id.slice(0, 8)}...</div>
                    <div className="mt-1 text-xs text-surface-500">
                      {Array.isArray(order.items) ? order.items.length : 0} items
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-700">
                    <div className="font-medium text-surface-900">{order.customer_email ?? 'Guest checkout'}</div>
                    <div className="mt-1 text-xs text-surface-500">
                      {order.user_id ? `Account ${order.user_id.slice(0, 8)}...` : 'Guest user'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-600">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getOrderStatusClasses(order.status)}`}>
                      {order.status}
                    </div>
                    <form action={updateOrderStatusAction} className="mt-3 flex gap-2">
                      <input type="hidden" name="order_id" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="rounded-lg border border-surface-300 px-2 py-1.5 text-xs text-surface-900"
                      >
                        {ORDER_STATUS_TABS.filter((tab) => tab.value !== 'All').map((tab) => (
                          <option key={tab.value} value={tab.value}>
                            {tab.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg border border-surface-300 px-2 py-1.5 text-xs font-medium text-surface-700 hover:bg-surface-100"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="max-w-[180px] px-4 py-4 text-sm text-surface-600">
                    {formatAddressSnippet(order.billing_address)}
                  </td>
                  <td className="max-w-[180px] px-4 py-4 text-sm text-surface-600">
                    {formatAddressSnippet(order.shipping_address)}
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-600">
                    <div>{order.payment_method ?? 'Unspecified'}</div>
                    <div className="mt-1 max-w-[170px] truncate font-mono text-xs text-surface-500">
                      {order.crypto_txid ?? order.payment_reference ?? 'No reference'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-surface-900">
                    {formatMoney(order.total_amount)}
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-600">
                    <div className="max-w-[150px] truncate font-mono">
                      {order.tracking_id ?? 'Pending'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-600">
                    <div>{order.attribution_source ?? 'Direct'}</div>
                    <div className="mt-1 max-w-[140px] truncate text-xs text-surface-500">
                      {order.attribution_detail ?? 'No detail'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex rounded-lg border border-surface-300 px-3 py-2 text-xs font-medium text-surface-700 hover:bg-surface-100"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!orders || orders.length === 0) && (
          <div className="px-6 py-16 text-center text-surface-500">
            No orders match the current status and filter combination.
          </div>
        )}
      </div>
    </div>
  );
}
