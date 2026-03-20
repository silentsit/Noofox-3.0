'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONRAMP_URL =
  process.env.NEXT_PUBLIC_ONRAMP_URL ?? 'https://guardarian.com/buy-crypto-with-card';

const steps = [
  {
    title: 'Choose your product',
    copy: 'Pick a package on any product page and tap Buy now — we take you straight to checkout.',
    icon: Wallet,
  },
  {
    title: 'Pay with crypto or card',
    copy: 'Crypto goes directly to our wallet. For card, open Guardarian to buy crypto, then return here to send funds and confirm your TxID.',
    icon: CreditCard,
  },
  {
    title: 'We verify & ship',
    copy: 'After we match your payment, your order is processed with discreet, tracked delivery worldwide.',
    icon: ShieldCheck,
  },
];

export function PaymentEducation() {
  return (
    <section
      className="relative overflow-hidden border-y border-border bg-gradient-to-b from-card/80 to-background py-20"
      aria-labelledby="payment-flow-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Payments</p>
          <h2 id="payment-flow-heading" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Fiat or crypto — you always settle in crypto
          </h2>
          <p className="mt-4 text-muted-foreground">
            Noofox is built for privacy-first checkout. Use your own wallet, or buy crypto with a
            card through our partner Guardarian and complete the transfer on this site.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="relative rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <step.icon className="h-6 w-6" aria-hidden />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Step {i + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.copy}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild size="lg">
            <Link href="/shop">
              Shop products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={ONRAMP_URL} target="_blank" rel="noopener noreferrer">
              Open Guardarian (card → crypto)
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
