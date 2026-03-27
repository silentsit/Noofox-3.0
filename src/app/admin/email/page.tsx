import { requireAdminPage } from '@/lib/rbac';
import { AdminEmailConsole } from '@/components/admin/AdminEmailConsole';

export const dynamic = 'force-dynamic';

export default async function AdminEmailPage() {
  await requireAdminPage({ action: 'read', resource: 'email' });
  return <AdminEmailConsole />;
}

