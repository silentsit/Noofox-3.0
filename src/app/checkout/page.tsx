'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const ONRAMP_URL = process.env.NEXT_PUBLIC_ONRAMP_URL ?? 'https://guardarian.com/buy-crypto-with-card';

const CRYPTO_WALLETS: { symbol: string; name: string; address: string; network: string }[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    address: process.env.NEXT_PUBLIC_WALLET_BTC ?? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    network: 'Bitcoin (BTC)',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: process.env.NEXT_PUBLIC_WALLET_ETH ?? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    network: 'Ethereum (ERC-20)',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: process.env.NEXT_PUBLIC_WALLET_USDT ?? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    network: 'Ethereum (ERC-20)',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: process.env.NEXT_PUBLIC_WALLET_USDC ?? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    network: 'Ethereum (ERC-20)',
  },
];

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
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="font-medium">Payment failed</p>
        <p className="text-sm mt-1 opacity-80">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          router.replace('/checkout', { scroll: false });
        }}
        className="shrink-0 font-medium text-sm hover:opacity-80"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy to clipboard"
      className="ml-2 shrink-0 text-muted-foreground hover:text-primary transition-colors"
    >
      {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function CheckoutContent() {
  const { items, removeItem, setQuantity, total, clearCart } = useCart();
  const [paymentMode, setPaymentMode] = useState<'card' | 'crypto'>('card');
  const [guestEmail, setGuestEmail] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<string>(CRYPTO_WALLETS[0]?.symbol ?? 'BTC');
  const [txHash, setTxHash] = useState('');
  const router = useRouter();

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  const selectedWallet = CRYPTO_WALLETS.find((w) => w.symbol === selectedCoin) ?? CRYPTO_WALLETS[0];

  async function handlePlaceOrder() {
    if (items.length === 0) return;
    if (paymentMode === 'card') {
      window.open(ONRAMP_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!txHash.trim()) {
      setPlaceError('Please enter your transaction hash / TxID before placing the order.');
      return;
    }
    setPlacing(true);
    setPlaceError(null);
    const email = userEmail || guestEmail.trim() || undefined;
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        customer_email: email,
        payment_method: `crypto_${selectedCoin.toLowerCase()}`,
        payment_reference: txHash.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setPlacing(false);
    if (!res.ok) {
      setPlaceError((data.error as string) || 'Failed to place order.');
      return;
    }
    router.push(`/checkout/success?orderId=${(data as { orderId?: string }).orderId ?? ''}&coin=${selectedCoin}`);
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="secondary">Checkout</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Complete Your Order
          </h1>
          <p className="mt-4 text-muted-foreground">
            Review your order and choose a payment method.
          </p>
        </div>

        <Suspense fallback={null}>
          <CheckoutErrorToast />
        </Suspense>

        {placeError && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
            {placeError}
          </div>
        )}

        {!userEmail && items.length > 0 && (
          <div className="mb-8 max-w-md">
            <Label htmlFor="guest-email">Email (for order updates)</Label>
            <Input
              id="guest-email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2"
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Payment method</h2>
              <div className="mt-4 flex gap-2 rounded-lg border border-border p-1">
                <button
                  type="button"
                  onClick={() => setPaymentMode('card')}
                  className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                    paymentMode === 'card'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('crypto')}
                  className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                    paymentMode === 'crypto'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Crypto
                </button>
              </div>

              {paymentMode === 'card' && (
                <div className="mt-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have crypto? You can buy it with your credit or debit card
                    via our partner <strong className="text-foreground">Guardarian</strong>. You will then return here
                    to complete payment by sending your crypto to the Noofox wallet.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Click below to open Guardarian and buy crypto with your card.</li>
                    <li>Return to this page and switch to the <strong className="text-foreground">Crypto</strong> tab above.</li>
                    <li>Send the order total to our wallet and enter your transaction hash.</li>
                    <li>Click <strong className="text-foreground">Place order</strong> to complete.</li>
                  </ol>
                  <Button asChild className="w-full sm:w-auto">
                    <a
                      href={ONRAMP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Go to Guardarian — Buy crypto with card
                    </a>
                  </Button>
                </div>
              )}

              {paymentMode === 'crypto' && (
                <div className="mt-6 space-y-5">
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
                    <strong>How to pay with crypto:</strong>
                    <ol className="mt-2 list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Select your preferred cryptocurrency below.</li>
                      <li>Send the exact order total (in that coin) to the wallet address shown.</li>
                      <li>Paste your transaction hash / TxID into the field below.</li>
                      <li>Click <strong className="text-foreground">Place order</strong> — we will verify and process your order.</li>
                    </ol>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Select cryptocurrency</p>
                    <div className="flex flex-wrap gap-2">
                      {CRYPTO_WALLETS.map((wallet) => (
                        <button
                          key={wallet.symbol}
                          type="button"
                          onClick={() => setSelectedCoin(wallet.symbol)}
                          className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                            selectedCoin === wallet.symbol
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-foreground hover:border-primary/50'
                          }`}
                        >
                          {wallet.symbol}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedWallet && (
                    <div className="rounded-xl border border-border bg-muted p-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {selectedWallet.name} — {selectedWallet.network}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Send only {selectedWallet.symbol} to this address.</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                        <code className="flex-1 break-all text-sm font-mono select-all">
                          {selectedWallet.address}
                        </code>
                        <CopyButton text={selectedWallet.address} />
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                        <span className="text-sm">Amount to send:</span>
                        <span className="font-semibold">${total.toFixed(2)} USD</span>
                        <span className="text-xs text-muted-foreground">(in {selectedWallet.symbol} equivalent)</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="tx-hash">
                      Transaction hash / TxID <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      After sending, paste the transaction ID from your wallet or exchange.
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                      <input
                        id="tx-hash"
                        type="text"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="0xabc123… or txid:abc123…"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                      {txHash && <CopyButton text={txHash} />}
                    </div>
                  </div>

                  <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-muted-foreground">
                    Your order will be placed with <strong className="text-foreground">Pending Payment</strong> status. Once we confirm
                    your transaction on-chain, we will update the status and dispatch your order.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Cart summary</h2>
              {items.length === 0 ? (
                <div className="mt-4 text-center text-muted-foreground">
                  <p>Your cart is empty.</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/">Continue shopping</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                      <li
                        key={item.product_id}
                        className="flex gap-3 border-b border-border pb-3 last:border-0"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {item.image_url && (item.image_url.startsWith('http') || item.image_url.startsWith('/')) ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized={item.image_url.startsWith('http')}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                              —
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${Number(item.price).toFixed(2)} ×{' '}
                            <select
                              value={item.quantity}
                              onChange={(e) =>
                                setQuantity(item.product_id, Number(e.target.value))
                              }
                              className="rounded border border-border bg-background text-foreground text-sm"
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
                          <p className="font-medium">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id)}
                            className="text-sm text-destructive hover:opacity-80"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-semibold text-primary">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={clearCart}
                  >
                    Clear cart
                  </Button>
                  <Button
                    className="mt-3 w-full"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                  >
                    {paymentMode === 'card'
                      ? 'Go to Guardarian to buy crypto'
                      : placing
                        ? 'Placing order…'
                        : 'Place order'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-muted-foreground">Loading…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
