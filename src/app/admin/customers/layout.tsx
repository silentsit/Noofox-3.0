import { requireAdminPage } from '@/lib/rbac';

export default async function AdminCustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage({ action: 'read', resource: 'users' });
  return <>{children}</>;
}
