'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/orders', label: 'Order history' },
  { href: '/dashboard/profile', label: 'Profile & shipping' },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-surface-200" aria-label="Dashboard">
      <ul className="flex gap-6">
        {links.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-surface-600 hover:text-surface-900'
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
