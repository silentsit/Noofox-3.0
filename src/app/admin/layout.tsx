import Link from 'next/link';
import { requireAdminPage } from '@/lib/rbac';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', permission: { action: 'read', resource: 'dashboard' } },
  { href: '/admin/orders', label: 'Orders', permission: { action: 'read', resource: 'orders' } },
  { href: '/admin/products', label: 'Products', permission: { action: 'read', resource: 'products' } },
  { href: '/admin/users', label: 'Users', permission: { action: 'read', resource: 'users' } },
  { href: '/admin/customers', label: 'Customers', permission: { action: 'read', resource: 'users' } },
  { href: '/admin/blog', label: 'Blog', permission: { action: 'read', resource: 'blog' } },
  { href: '/admin/media', label: 'Media', permission: { action: 'read', resource: 'media' } },
  { href: '/admin/accounting', label: 'Accounting', permission: { action: 'read', resource: 'analytics' } },
  { href: '/admin/coupons', label: 'Coupons', permission: { action: 'read', resource: 'coupons' } },
  { href: '/admin/email', label: 'Email', permission: { action: 'read', resource: 'email' } },
  { href: '/admin/social-proof', label: 'Social proof', permission: { action: 'read', resource: 'social_proof' } },
  { href: '/admin/audit-log', label: 'Audit', permission: { action: 'read', resource: 'audit_log' } },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdminPage({ action: 'read', resource: 'dashboard' });

  const visibleItems = NAV_ITEMS.filter((item) => admin.hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-surface-200 bg-surface-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="text-lg font-semibold text-white">
            Admin · Mission Control
          </Link>
          <nav className="flex gap-4">
            {visibleItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-surface-400 hover:text-white">
                {item.label}
              </Link>
            ))}
            <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Store
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

