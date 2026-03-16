'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { href: '/shop', label: 'Products' },
  { href: '/blog', label: 'Blog' },
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
    <header
      className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/92 backdrop-blur supports-[backdrop-filter]:bg-[#07111f]/78 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 min-w-0 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-white hover:text-brand-100 transition-colors shrink-0 sm:text-2xl min-h-[44px] flex items-center"
        >
          Noofox
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-brand-100 ${
                pathname === href ? 'text-brand-100' : 'text-surface-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/checkout"
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center text-surface-300 hover:text-brand-100 transition-colors rounded-full"
            aria-label={`Cart (${cartCount} items)`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-brand-300 text-[10px] font-bold text-surface-950">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/shop"
            className="rounded-full bg-brand-300 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-brand-200 transition-colors min-h-[44px] inline-flex items-center justify-center"
          >
            Shop Now
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-surface-400 hover:text-brand-100 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-surface-400 hover:text-brand-100 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile toggle — 44px min touch target */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-surface-300 hover:text-white hover:bg-white/5 -mr-2"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu — full-width tap targets */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#07111f] px-4 pb-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-1 py-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="min-h-[48px] flex items-center px-4 text-sm font-medium text-surface-300 hover:text-brand-100 rounded-lg hover:bg-white/5 -mx-2"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/checkout"
              onClick={() => setMobileOpen(false)}
              className="min-h-[48px] flex items-center gap-2 px-4 text-sm font-medium text-surface-300 hover:text-brand-100 rounded-lg hover:bg-white/5 -mx-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart {cartCount > 0 ? `(${cartCount})` : ''}
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="mt-2 min-h-[48px] flex items-center justify-center rounded-full bg-brand-300 text-sm font-semibold text-surface-950 hover:bg-brand-200"
            >
              Shop Now
            </Link>
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="min-h-[48px] flex items-center px-4 text-sm text-surface-400 hover:text-brand-100 rounded-lg hover:bg-white/5 -mx-2">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="min-h-[48px] flex items-center px-4 text-sm text-surface-400 hover:text-brand-100 rounded-lg hover:bg-white/5 -mx-2">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
