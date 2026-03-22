'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const ONRAMP_URL = process.env.NEXT_PUBLIC_ONRAMP_URL ?? 'https://guardarian.com/buy-crypto-with-card';
const REVOLUT_PAY_URL =
  process.env.NEXT_PUBLIC_REVOLUT_PAY_URL ?? 'https://www.revolut.com/pay-online/';

const FULL_GUARANTEE_SHIPPING =
  'Full Guarantee Shipping (We ship thrice, before offering full refund if unsuccessful)';

const COUNTRIES = [
  { value: 'US', label: 'United States (US)' },
  { value: 'GB', label: 'United Kingdom (GB)' },
  { value: 'CA', label: 'Canada (CA)' },
  { value: 'AU', label: 'Australia (AU)' },
  { value: 'DE', label: 'Germany (DE)' },
  { value: 'FR', label: 'France (FR)' },
  { value: 'NL', label: 'Netherlands (NL)' },
  { value: 'SG', label: 'Singapore (SG)' },
  { value: 'OTHER', label: 'Other' },
] as const;

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
      className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive"
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Payment failed</p>
        <p className="mt-1 text-sm opacity-80">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          router.replace('/checkout', { scroll: false });
        }}
        className="shrink-0 text-sm font-medium hover:opacity-80"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}

type PaymentChoice = 'pay_card' | 'pay_revolut' | 'pay_crypto';

function CheckoutContent() {
  const { items, removeItem, setQuantity, total, clearCart } = useCart();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [country, setCountry] = useState('US');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>('pay_card');
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      const e = user?.email ?? null;
      setUserEmail(e);
      if (e) setEmail(e);
    });
  }, []);

  const subtotal = total;
  const shipping = 0;
  const cryptoDiscount = paymentChoice === 'pay_crypto' ? Math.round(subtotal * 0.15 * 100) / 100 : 0;
  const orderTotal = Math.max(0, subtotal - cryptoDiscount + shipping);

  function validate(): string | null {
    if (items.length === 0) return 'Your basket is empty.';
    const em = (userEmail || email).trim();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return 'Please enter a valid email address.';
    if (!firstName.trim() || !lastName.trim()) return 'Please enter your first and last name.';
    if (!address1.trim()) return 'Please enter your street address.';
    if (!city.trim() || !state.trim() || !postcode.trim()) return 'Please enter city, state, and postcode.';
    return null;
  }

  async function handlePlaceOrder() {
    const err = validate();
    if (err) {
      setPlaceError(err);
      return;
    }
    setPlaceError(null);
    setPlacing(true);

    const em = (userEmail || email).trim();
    const countryLabel = COUNTRIES.find((c) => c.value === country)?.label ?? country;

    const shipping_address = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      address_line_1: address1.trim(),
      address_line_2: address2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      postcode: postcode.trim(),
      country,
      country_label: countryLabel,
      phone: phone.trim() || undefined,
      meta: {
        create_account_requested: createAccount,
        marketing_opt_in: marketingOptIn,
        same_as_billing: sameAsBilling,
        order_note: showOrderNote ? orderNote.trim() || undefined : undefined,
        shipping_method: FULL_GUARANTEE_SHIPPING,
        coupon_attempted: showCoupon ? couponCode.trim() || undefined : undefined,
      },
    };

    const billing_address = sameAsBilling ? shipping_address : { ...shipping_address };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer_email: em,
          shipping_address,
          billing_address,
          payment_method: paymentChoice,
          payment_reference: null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPlaceError((data.error as string) || 'Failed to place order.');
        setPlacing(false);
        return;
      }
      const orderId = (data as { orderId?: string }).orderId ?? '';

      clearCart();

      if (paymentChoice === 'pay_card') {
        window.open(ONRAMP_URL, '_blank', 'noopener,noreferrer');
      } else if (paymentChoice === 'pay_revolut') {
        window.open(REVOLUT_PAY_URL, '_blank', 'noopener,noreferrer');
      }

      const q =
        paymentChoice === 'pay_crypto'
          ? `orderId=${orderId}&method=crypto&coin=BTC`
          : `orderId=${orderId}&method=${paymentChoice}`;
      router.push(`/checkout/success?${q}`);
    } catch {
      setPlaceError('Network error. Please try again.');
      setPlacing(false);
    }
  }

  const inputClass =
    'mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring';

  return (
    <div className="min-w-0 bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Checkout</h1>

        <Suspense fallback={null}>
          <CheckoutErrorToast />
        </Suspense>

        {placeError && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
            {placeError}
          </div>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_min(100%,380px)] lg:gap-12">
          {/* Main form */}
          <div className="min-w-0 space-y-10">
            {/* 1. Contact */}
            <section className="space-y-4" aria-labelledby="checkout-contact-heading">
              <h2 id="checkout-contact-heading" className="text-lg font-semibold">
                1. Contact information
              </h2>
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Log in
                </Link>
                .
              </p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll use this email to send you details and updates about your order.
              </p>
              <div>
                <Label htmlFor="checkout-email">Email address</Label>
                <Input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  value={userEmail ?? email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!userEmail}
                  className="mt-1.5"
                  placeholder="you@example.com"
                />
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                <span>Create an account?</span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                <span>Contact me for updates on service disruptions, price changes and more.</span>
              </label>
            </section>

            <Separator />

            {/* 2. Shipping */}
            <section className="space-y-4" aria-labelledby="checkout-shipping-heading">
              <h2 id="checkout-shipping-heading" className="text-lg font-semibold">
                2. Shipping address
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter the address where you want your order delivered.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="checkout-fn">First name</Label>
                  <input
                    id="checkout-fn"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label htmlFor="checkout-ln">Last name</Label>
                  <input
                    id="checkout-ln"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="checkout-address">Address</Label>
                <input
                  id="checkout-address"
                  autoComplete="street-address"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <Label htmlFor="checkout-address2">Flat, suite, etc. (optional)</Label>
                <input
                  id="checkout-address2"
                  autoComplete="address-line2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <Label htmlFor="checkout-country">Country / Region</Label>
                <select
                  id="checkout-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClass}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="checkout-city">City</Label>
                  <input
                    id="checkout-city"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label htmlFor="checkout-state">State</Label>
                  <input
                    id="checkout-state"
                    autoComplete="address-level1"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="checkout-postcode">Postcode</Label>
                  <input
                    id="checkout-postcode"
                    autoComplete="postal-code"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label htmlFor="checkout-phone">Phone (optional)</Label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                <span>Use same address for billing</span>
              </label>
            </section>

            <Separator />

            {/* 3. Shipping options */}
            <section aria-labelledby="checkout-shipopt-heading">
              <h2 id="checkout-shipopt-heading" className="text-lg font-semibold">
                3. Shipping options
              </h2>
              <p className="mt-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                {FULL_GUARANTEE_SHIPPING}
              </p>
            </section>

            <Separator />

            {/* 4. Payment */}
            <section className="space-y-4" aria-labelledby="checkout-pay-heading">
              <h2 id="checkout-pay-heading" className="text-lg font-semibold">
                4. Payment options
              </h2>
              <div
                className="space-y-3 rounded-xl border border-border p-4"
                role="radiogroup"
                aria-label="Payment method"
              >
                <label
                  className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors ${
                    paymentChoice === 'pay_card' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-transparent hover:bg-muted/50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentChoice === 'pay_card'}
                      onChange={() => setPaymentChoice('pay_card')}
                      className="h-4 w-4 border-border text-primary"
                    />
                    <span className="font-medium">Pay with Credit Cards</span>
                  </span>
                  <p className="pl-7 text-xs text-muted-foreground">
                    *Disable VPN for better success rates. **Payment options vary by location. Try alternative providers
                    if needed.
                  </p>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                    paymentChoice === 'pay_revolut'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-transparent hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentChoice === 'pay_revolut'}
                    onChange={() => setPaymentChoice('pay_revolut')}
                    className="h-4 w-4 border-border text-primary"
                  />
                  <span className="font-medium">Pay with Revolut</span>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                    paymentChoice === 'pay_crypto'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-transparent hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentChoice === 'pay_crypto'}
                    onChange={() => setPaymentChoice('pay_crypto')}
                    className="h-4 w-4 border-border text-primary"
                  />
                  <span className="font-medium">Pay with Crypto (15% Off)</span>
                </label>
              </div>
            </section>

            <Separator />

            <div className="space-y-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={showOrderNote}
                  onChange={(e) => setShowOrderNote(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border"
                />
                <span>Add a note to your order</span>
              </label>
              {showOrderNote && (
                <Textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Special delivery instructions, etc."
                  className="min-h-24"
                />
              )}
              <p className="text-sm text-muted-foreground">
                Please wait 10 to 15 seconds after clicking &quot;Place Order&quot; as we redirect you to our payment
                partners.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Return to Basket
              </Link>
              <Button
                type="button"
                size="lg"
                className="w-full sm:w-auto sm:min-w-[200px]"
                disabled={placing || items.length === 0}
                onClick={handlePlaceOrder}
              >
                {placing ? 'Placing order…' : 'Place Order'}
              </Button>
            </div>
          </div>

          {/* Order summary */}
          <aside className="min-w-0">
            <div className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-28">
              <h2 className="text-lg font-semibold">Order summary</h2>

              {items.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Your basket is empty.</p>
              ) : (
                <>
                  <ul className="mt-4 space-y-4">
                    {items.map((item) => (
                      <li key={item.product_id} className="flex gap-3 border-b border-border pb-4 last:border-0">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.image_url && (item.image_url.startsWith('http') || item.image_url.startsWith('/')) ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized={item.image_url.startsWith('http')}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              —
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug">{item.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            ${Number(item.price).toFixed(2)} ×{' '}
                            <select
                              value={item.quantity}
                              onChange={(e) => setQuantity(item.product_id, Number(e.target.value))}
                              className="rounded border border-border bg-background px-1.5 py-0.5 text-sm"
                              aria-label={`Quantity for ${item.name}`}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id)}
                            className="mt-1 text-xs text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="shrink-0 font-medium">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => setShowCoupon((s) => !s)}
                    className="mt-4 text-sm font-medium text-primary hover:underline"
                  >
                    Add a coupon
                  </button>
                  {showCoupon && (
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button type="button" variant="secondary" disabled>
                        Apply
                      </Button>
                    </div>
                  )}

                  <Separator className="my-5" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {cryptoDiscount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Crypto discount (15%)</span>
                        <span>-${cryptoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{FULL_GUARANTEE_SHIPPING}</p>
                    <p className="text-xs text-muted-foreground">
                      {firstName && address1
                        ? `${firstName} ${lastName}, ${address1}, ${city}, ${state} ${postcode}`
                        : 'Enter shipping address to see delivery summary.'}
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between text-base font-semibold">
                    <span>Total</span>
                    <span className="text-primary">${orderTotal.toFixed(2)}</span>
                  </div>

                  <Button variant="outline" className="mt-5 w-full" type="button" onClick={clearCart}>
                    Clear basket
                  </Button>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-12 text-muted-foreground">Loading…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
