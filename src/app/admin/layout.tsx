import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-surface-200 bg-surface-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="text-lg font-semibold text-white"
          >
            Admin · Mission Control
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/admin"
              className="text-sm font-medium text-surface-400 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-surface-400 hover:text-white"
            >
              Orders
            </Link>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-surface-400 hover:text-white"
            >
              Products
            </Link>
            <Link
              href="/admin/users"
              className="text-sm font-medium text-surface-400 hover:text-white"
            >
              Users
            </Link>
            <Link
              href="/admin/blog"
              className="text-sm font-medium text-surface-400 hover:text-white"
            >
              Blog
            </Link>
            <Link
              href="/admin/accounting"
              className="text-sm font-medium text-surface-400 hover:text-white"
            >
              Accounting
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Store
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
