import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07111f] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl min-w-0 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="min-w-0">
            <Link href="/" className="font-display text-2xl sm:text-3xl text-white hover:text-brand-100 transition-colors inline-block min-h-[44px] flex items-center">
              Noofox
            </Link>
            <p className="mt-4 text-sm text-surface-500 leading-relaxed">
              Premium cognitive enhancers with preserved live-product data, clearer trust cues, and a calmer buying experience.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
              Products
            </h4>
            <ul className="mt-4 space-y-1">
              <li>
                <Link href="/shop" className="block py-2.5 text-sm text-surface-500 hover:text-brand-100 transition-colors min-h-[44px] flex items-center">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop" className="block py-2.5 text-sm text-surface-500 hover:text-brand-100 transition-colors min-h-[44px] flex items-center">
                  Nootropics
                </Link>
              </li>
              <li>
                <Link href="/blog" className="block py-2.5 text-sm text-surface-500 hover:text-brand-100 transition-colors min-h-[44px] flex items-center">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="block py-2.5 text-sm text-surface-500 hover:text-brand-100 transition-colors min-h-[44px] flex items-center">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
              Support
            </h4>
            <ul className="mt-4 space-y-1">
              <li>
                <Link href="/#faq" className="block py-2.5 text-sm text-surface-500 hover:text-brand-100 transition-colors min-h-[44px] flex items-center">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/#payment" className="block py-2.5 text-sm text-surface-500 hover:text-brand-100 transition-colors min-h-[44px] flex items-center">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="block py-2.5 text-sm text-surface-500 hover:text-brand-100 transition-colors min-h-[44px] flex items-center">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/about" className="block py-2.5 text-sm text-surface-500 hover:text-brand-100 transition-colors min-h-[44px] flex items-center">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* We Accept */}
          <div className="min-w-0">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
              We Accept
            </h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {['BTC', 'ETH', 'USDT', 'USDC', 'Card'].map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-surface-300"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-surface-600">
            &copy; {new Date().getFullYear()} Noofox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
