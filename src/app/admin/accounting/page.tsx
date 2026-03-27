import { createClient } from '@/lib/supabase/server';
import { requireAdminPage } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminAccountingPage() {
  await requireAdminPage({ action: 'read', resource: 'analytics' });
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at')
    .order('created_at', { ascending: false });

  const completed = (orders ?? []).filter((o) => o.status === 'Completed');
  const revenueByMonth: Record<string, { revenue: number; orders: number }> = {};
  for (const o of completed) {
    const month = new Date(o.created_at).toISOString().slice(0, 7);
    if (!revenueByMonth[month]) revenueByMonth[month] = { revenue: 0, orders: 0 };
    revenueByMonth[month].revenue += Number(o.total_amount);
    revenueByMonth[month].orders += 1;
  }
  const months = Object.entries(revenueByMonth).sort(([a], [b]) => b.localeCompare(a));
  const totalRevenue = completed.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-surface-900">Accounting</h1>
      <p className="mt-1 text-surface-500">
        Revenue from completed orders. Cost entries and profit breakdown can be added later.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Total revenue</p>
          <p className="mt-2 text-2xl font-semibold text-surface-900">
            ${totalRevenue.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-surface-500">Completed orders only</p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Completed orders</p>
          <p className="mt-2 text-2xl font-semibold text-surface-900">{completed.length}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-surface-900">Revenue by month</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-surface-200">
            <thead className="bg-surface-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Month
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Orders
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 bg-white">
              {months.map(([month, data]) => (
                <tr key={month} className="hover:bg-surface-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-surface-900 sm:px-6">
                    {new Date(month + '-01').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-surface-600 sm:px-6">
                    {data.orders}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-surface-900 sm:px-6">
                    ${data.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {months.length === 0 && (
            <div className="px-6 py-12 text-center text-surface-500">No completed orders yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
