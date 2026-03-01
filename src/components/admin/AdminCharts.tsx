'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  sales: number;
  orders: number;
}

interface StatusPoint {
  name: string;
  count: number;
}

export function AdminCharts({
  chartData,
  statusData,
}: {
  chartData: ChartDataPoint[];
  statusData: StatusPoint[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900">Sales & orders (last 14 days)</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                name="Sales ($)"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#71717a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900">Orders by status</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Orders" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
