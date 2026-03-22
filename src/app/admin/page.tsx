import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { AdminCharts } from '@/components/admin/AdminCharts';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const totalSales = (orders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
  const activeOrders = (orders ?? []).filter(
    (o) => o.status !== 'Completed' && o.status !== 'Cancelled'
  ).length;

  const byDay: Record<string, { date: string; sales: number; orders: number }> = {};
  for (const o of orders ?? []) {
    const d = new Date(o.created_at).toISOString().slice(0, 10);
    if (!byDay[d]) byDay[d] = { date: d, sales: 0, orders: 0 };
    byDay[d].sales += Number(o.total_amount);
    byDay[d].orders += 1;
  }
  const chartData = Object.values(byDay).sort(
    (a, b) => a.date.localeCompare(b.date)
  ).slice(-14);

  const statusCounts: Record<string, number> = {};
  for (const o of orders ?? []) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }
  const statusData = Object.entries(statusCounts).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Mission Control</h1>
        <p className="mt-1 text-surface-500">
          Overview of sales, orders, and user growth.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Total sales</p>
          <p className="mt-2 text-2xl font-semibold text-surface-900">
            ${totalSales.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Active orders</p>
          <p className="mt-2 text-2xl font-semibold text-surface-900">
            {activeOrders}
          </p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-surface-500">Total orders</p>
          <p className="mt-2 text-2xl font-semibold text-surface-900">
            {totalOrders ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-surface-500">User growth</p>
          <p className="mt-2 text-2xl font-semibold text-surface-900">
            {totalUsers ?? 0} users
          </p>
        </div>
      </div>

      <AdminCharts chartData={chartData} statusData={statusData} />

      <div className="flex gap-4">
        <Link
          href="/admin/orders"
          className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700"
        >
          Manage orders
        </Link>
        <Link
          href="/admin/products"
          className="rounded-lg border border-surface-300 bg-white px-4 py-2.5 font-medium text-surface-700 hover:bg-surface-50"
        >
          Manage products
        </Link>
      </div>
    </div>
  );
}
