'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle } from 'lucide-react';

const CHANGEHERO_URL = 'https://changehero.io';

const ERROR_MESSAGES: Record<string, string> = {
  payment_failed: 'Payment was rejected. Your cart has been preserved. Please try again or choose another method.',
  payment_rejected: 'Payment was rejected. Your cart has been preserved. Please try again or choose another method.',
  auth: 'Authentication error. Please sign in again.',
};

function CheckoutErrorToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorCode = searchParams.get('error');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!errorCode || dismissed) return;
    const t = setTimeout(() => setDismissed(true), 15000);
    return () => clearTimeout(t);
  }, [errorCode, dismissed]);

  if (!errorCode || dismissed) return null;

  const message = ERROR_MESSAGES[errorCode] ?? 'Something went wrong. Your cart has been preserved.';

  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="font-medium">Payment failed</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          router.replace('/checkout', { scroll: false });
        }}
        className="shrink-0 text-red-600 hover:text-red-800 font-medium text-sm"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}

function CheckoutContent() {
  const { items, removeItem, setQuantity, total, clearCart } = useCart();
  const [paymentMode, setPaymentMode] = useState<'card' | 'crypto'>('card');
  const [guestEmail, setGuestEmail] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  async function handlePlaceOrder() {
    if (items.length === 0) return;
    setPlacing(true);
    setPlaceError(null);
    const email = userEmail || guestEmail.trim() || undefined;
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        customer_email: email,
        payment_method: paymentMode === 'card' ? 'card_changehero' : 'crypto',
      }),
    });
    const data = await res.json().catch(() => ({}));
    setPlacing(false);
    if (!res.ok) {
      setPlaceError((data.error as string) || 'Failed to place order.');
      return;
    }
    if (paymentMode === 'card') {
      window.location.href = `${CHANGEHERO_URL}?order=${(data as { orderId?: string }).orderId ?? ''}`;
    } else {
      router.push(`/checkout/success?orderId=${(data as { orderId?: string }).orderId ?? ''}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-surface-900">Checkout</h1>
      <p className="mt-1 text-surface-600">
        Review your order and choose a payment method.
      </p>

      <Suspense fallback={null}>
        <CheckoutErrorToast />
      </Suspense>

      {placeError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {placeError}
        </div>
      )}

      {!userEmail && items.length > 0 && (
        <div className="mt-4 max-w-md">
          <label htmlFor="guest-email" className="block text-sm font-medium text-surface-700">
            Email (for order updates and guest reconciliation)
          </label>
          <input
            id="guest-email"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-surface-900"
          />
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section
            className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm"
            aria-labelledby="payment-heading"
          >
            <h2 id="payment-heading" className="text-lg font-semibold text-surface-900">
              Payment method
            </h2>
            <div className="mt-4 flex gap-2 rounded-lg border border-surface-200 p-1">
              <button
                type="button"
                onClick={() => setPaymentMode('card')}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  paymentMode === 'card'
                    ? 'bg-primary-600 text-white'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('crypto')}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                  paymentMode === 'crypto'
                    ? 'bg-primary-600 text-white'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                Crypto
              </button>
            </div>

            {paymentMode === 'card' && (
              <div className="mt-6 space-y-4">
                <p className="text-sm text-surface-700">
                  Don&apos;t have crypto? You can buy it with your card and complete
                  your purchase. We use ChangeHero as our external on-ramp—secure and
                  simple.
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <strong>No KYC required</strong> for purchases below $700 USD.
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={CHANGEHERO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary-600 bg-primary-600 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:border-primary-700 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    External On-Ramp — Pay with Card via ChangeHero
                  </a>
                </div>
                <p className="text-xs text-surface-500">
                  Placeholder: A future ChangeHero API integration will allow
                  embedded on-platform card purchasing.
                </p>
              </div>
            )}

            {paymentMode === 'crypto' && (
              <div className="mt-6 rounded-lg border border-surface-200 bg-surface-50 p-6">
                <p className="text-sm font-medium text-surface-700">
                  Crypto payment
                </p>
                <p className="mt-2 text-sm text-surface-600">
                  Placeholder for 3rd-party Web3 gateway integration. Connect wallet
                  and confirm transaction will appear here.
                </p>
                <div className="mt-4 h-12 w-full max-w-xs rounded-lg border border-dashed border-surface-300 bg-white flex items-center justify-center text-surface-500 text-sm">
                  Web3 gateway placeholder
                </div>
              </div>
            )}
          </section>
        </div>

        <div>
          <section
            className="sticky top-24 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm"
            aria-labelledby="cart-summary-heading"
          >
            <h2 id="cart-summary-heading" className="text-lg font-semibold text-surface-900">
              Cart summary
            </h2>
            {items.length === 0 ? (
              <div className="mt-4 text-center text-surface-600">
                <p>Your cart is empty.</p>
                <Link
                  href="/"
                  className="mt-2 inline-block font-medium text-primary-600 hover:text-primary-700"
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.product_id}
                      className="flex gap-3 border-b border-surface-100 pb-3 last:border-0"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-100">
                        {item.image_url && (item.image_url.startsWith('http') || item.image_url.startsWith('/')) ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized={item.image_url.startsWith('http')}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-surface-400 text-xs">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-surface-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-surface-600">
                          ${Number(item.price).toFixed(2)} ×{' '}
                          <select
                            value={item.quantity}
                            onChange={(e) =>
                              setQuantity(item.product_id, Number(e.target.value))
                            }
                            className="rounded border border-surface-300 text-surface-700"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-medium text-surface-900">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-surface-200 pt-4">
                  <span className="font-semibold text-surface-900">Total</span>
                  <span className="text-xl font-semibold text-primary-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-4 w-full rounded-lg border border-surface-300 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
                >
                  Clear cart
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="mt-4 w-full rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {placing ? 'Placing order…' : 'Place order'}
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12">Loading…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
