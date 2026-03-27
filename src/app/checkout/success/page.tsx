'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CRYPTO_WALLETS: Record<string, { name: string; network: string; address: string }> = {
  BTC: {
    name: 'Bitcoin',
    network: 'Bitcoin network',
    address: process.env.NEXT_PUBLIC_WALLET_BTC ?? 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  },
  ETH: {
    name: 'Ethereum',
    network: 'Ethereum (ERC-20)',
    address: process.env.NEXT_PUBLIC_WALLET_ETH ?? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  },
  USDT: {
    name: 'Tether USD',
    network: 'Ethereum (ERC-20)',
    address: process.env.NEXT_PUBLIC_WALLET_USDT ?? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  },
  USDC: {
    name: 'USD Coin',
    network: 'Ethereum (ERC-20)',
    address: process.env.NEXT_PUBLIC_WALLET_USDC ?? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  },
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method') ?? '';
  const coin = searchParams.get('coin')?.toUpperCase() ?? '';
  const isCardFlow = method === 'pay_card' || method === 'card';
  const showCryptoPay =
    coin && CRYPTO_WALLETS[coin] && (method === 'crypto' || method === 'pay_crypto');
  const wallet = showCryptoPay ? CRYPTO_WALLETS[coin] : undefined;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-lg px-4 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Order received!</h1>
          {orderId && (
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              Order #{orderId.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>

        {wallet ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 shrink-0 text-accent mt-0.5" />
              <div>
                <p className="font-medium">Awaiting payment confirmation</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your order is <strong className="text-foreground">Pending Payment</strong>. Once we confirm your{' '}
                  {wallet.name} transaction on-chain, we will process and dispatch your order.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Payment details — {wallet.name} ({coin})
              </p>
              <p className="text-xs text-muted-foreground">{wallet.network}</p>
              <code className="block break-all rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono">
                {wallet.address}
              </code>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <p>
                Send the correct amount from your wallet to the address above. Keep your receipt as proof of payment.
                If we cannot verify within 24 hours, we will reach out via email.
              </p>
            </div>
          </div>
        ) : isCardFlow ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground">
              Your card checkout is linked to this order. You can safely leave this page while payment is pending.
              Once Guardarian confirms the transaction, your order updates automatically.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground">
              Your order has been placed. You will receive a confirmation email once
              payment is verified.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard">View my orders</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-16 text-center text-muted-foreground">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
