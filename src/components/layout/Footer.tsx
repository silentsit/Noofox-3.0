import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-surface-800 bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-bold text-white hover:text-brand-400 transition-colors">
              Noofox
            </Link>
            <p className="mt-4 text-sm text-surface-500 leading-relaxed">
              Premium cognitive enhancers delivered discreetly to your door. Crypto payments accepted.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
              Products
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/shop" className="text-sm text-surface-500 hover:text-brand-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-surface-500 hover:text-brand-400 transition-colors">
                  Nootropics
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-surface-500 hover:text-brand-400 transition-colors">
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
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/#faq" className="text-sm text-surface-500 hover:text-brand-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/#payment" className="text-sm text-surface-500 hover:text-brand-400 transition-colors">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-surface-500 hover:text-brand-400 transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-surface-500 hover:text-brand-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* We Accept */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-surface-400">
              We Accept
            </h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {['BTC', 'ETH', 'USDT', 'USDC', 'Card'].map((m) => (
                <span
                  key={m}
                  className="rounded-lg border border-surface-800 bg-surface-900 px-3 py-1.5 text-xs font-medium text-surface-400"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-surface-800 pt-8">
          <p className="text-center text-sm text-surface-600">
            &copy; {new Date().getFullYear()} Noofox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
