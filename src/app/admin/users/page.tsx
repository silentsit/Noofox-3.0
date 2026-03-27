import { createClient } from '@/lib/supabase/server';
import { AdminUsersList } from '@/components/admin/AdminUsersList';
import { requireAdminPage } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await requireAdminPage({ action: 'read', resource: 'users' });
  const supabase = await createClient();
  const { data: users } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-surface-900">User management</h1>
      <p className="mt-1 text-surface-500">
        View accounts, send password reset links, and remove users.
      </p>
      <AdminUsersList users={users ?? []} />
    </div>
  );
}
