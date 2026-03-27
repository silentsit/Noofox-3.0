import { requireAdminPage } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AuditLogPage() {
  await requireAdminPage({ action: 'read', resource: 'audit_log' });

  const supabase = await createClient();
  const { data } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Audit log</h1>
        <p className="mt-1 text-surface-500">
          Immutable ledger of privileged admin mutations across products, orders, media, and users.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200">
            <thead className="bg-surface-50">
              <tr className="text-left text-xs uppercase tracking-[0.16em] text-surface-500">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Resource ID</th>
                <th className="px-4 py-3">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-50">
                  <td className="px-4 py-4 text-sm text-surface-600">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-surface-900">{row.action}</td>
                  <td className="px-4 py-4 text-sm text-surface-600">{row.resource_type}</td>
                  <td className="px-4 py-4 font-mono text-xs text-surface-600">{row.resource_id ?? '—'}</td>
                  <td className="px-4 py-4 font-mono text-xs text-surface-600">{row.actor_id ?? 'system'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="px-6 py-14 text-center text-surface-500">
            Audit entries will appear here after the new RBAC and action logging migrations are applied.
          </div>
        )}
      </div>
    </div>
  );
}
