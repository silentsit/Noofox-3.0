import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500">
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-surface-600 hover:text-primary-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-surface-600 hover:text-primary-600">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-surface-600 hover:text-primary-600">
                  About
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-surface-600 hover:text-primary-600">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-surface-600 hover:text-primary-600">
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500">
              Account
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/login" className="text-surface-600 hover:text-primary-600">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-surface-600 hover:text-primary-600">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500">
              Payment
            </h3>
            <p className="mt-4 text-sm text-surface-600">
              Pay with card (via ChangeHero) or crypto. No KYC for purchases under $700 USD.
            </p>
          </div>
          <div>
            <p className="text-sm text-surface-500">
              &copy; {new Date().getFullYear()} Noofox. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
