import { requireAdminPage } from '@/lib/rbac';

export default async function AdminCouponsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage({ action: 'read', resource: 'coupons' });
  return <>{children}</>;
}
