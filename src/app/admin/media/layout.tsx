import { requireAdminPage } from '@/lib/rbac';

export default async function AdminMediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage({ action: 'read', resource: 'media' });
  return <>{children}</>;
}
