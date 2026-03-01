'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/shipping', label: 'Shipping' },
  { href: '/checkout', label: 'Checkout' },
];

export function Header() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-surface-900 hover:text-primary-600"
        >
          Noofox
        </Link>
        <div className="flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                pathname === href ? 'text-primary-600' : 'text-surface-600'
              }`}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-surface-100 px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-200"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
