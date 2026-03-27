import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type OrderRow = {
  user_id: string | null;
  customer_email: string | null;
  total_amount: number | string | null;
};

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from('users')
    .select('id, email, created_at, role')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .limit(300);

  const { data: orders } = await supabase
    .from('orders')
    .select('user_id, customer_email, total_amount');

  const orderList = (orders ?? []) as OrderRow[];

  const rows = (users ?? []).map((u) => {
    const emailKey = u.email?.trim().toLowerCase() ?? '';
    let revenue = 0;
    let orderCount = 0;
    for (const o of orderList) {
      const amt = Number(o.total_amount ?? 0);
      if (o.user_id === u.id) {
        revenue += amt;
        orderCount += 1;
      } else if (!o.user_id && emailKey && o.customer_email?.trim().toLowerCase() === emailKey) {
        revenue += amt;
        orderCount += 1;
      }
    }
    const aov = orderCount > 0 ? revenue / orderCount : 0;
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      orderCount,
      revenue,
      aov,
    };
  });

  rows.sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Customers</h1>
        <p className="mt-1 text-surface-500">
          Registered customers with order totals (USD). Revenue uses orders linked to the account or matching email.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-surface-200 text-sm">
          <thead className="bg-surface-50 text-left text-xs font-medium uppercase tracking-wide text-surface-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">AOV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-surface-900">{row.email}</td>
                <td className="px-4 py-3 text-surface-600">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{row.orderCount}</td>
                <td className="px-4 py-3">${row.revenue.toFixed(2)}</td>
                <td className="px-4 py-3">${row.aov.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
