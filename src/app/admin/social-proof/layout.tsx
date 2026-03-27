import { requireAdminPage } from '@/lib/rbac';

export default async function AdminSocialProofLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage({ action: 'read', resource: 'social_proof' });
  return <>{children}</>;
}
