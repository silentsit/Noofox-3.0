'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { href: '/shop', label: 'Products' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#payment', label: 'Payment' },
  { href: '/#faq', label: 'FAQ' },
];

export function Header() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

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
    <header className="sticky top-0 z-50 border-b border-surface-800 bg-surface-950/95 backdrop-blur supports-[backdrop-filter]:bg-surface-950/80">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white hover:text-brand-400 transition-colors"
        >
          Noofox
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-brand-400 ${
                pathname === href ? 'text-brand-400' : 'text-surface-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/checkout"
            className="relative text-surface-300 hover:text-brand-400 transition-colors"
            aria-label={`Cart (${cartCount} items)`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/shop"
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Shop Now
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-surface-400 hover:text-brand-400 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-surface-400 hover:text-brand-400 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-surface-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-800 bg-surface-950 px-4 pb-4">
          <div className="flex flex-col gap-3 py-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-surface-300 hover:text-brand-400"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-brand-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
            >
              Shop Now
            </Link>
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm text-surface-400 hover:text-brand-400">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-surface-400 hover:text-brand-400">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
