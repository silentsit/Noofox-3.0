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
    title: 'Pay with crypto or credit card',
    copy: 'Crypto goes directly to our wallet. For card, open Guardarian to buy crypto, then return here to send funds and confirm your TxID.',
    icon: CreditCard,
  },
  {
    title: 'We verify & ship',
    copy: 'After we match your payment, your order is processed and sent out. Tracking number will be sent to you within 72 hours.',
    icon: ShieldCheck,
  },
];

export function PaymentEducation() {
  return (
    <section
      className="relative overflow-hidden border-y border-border bg-gradient-to-b from-card/80 to-background py-12 sm:py-16 lg:py-20"
      aria-labelledby="payment-flow-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Payments</p>
          <h2
            id="payment-flow-heading"
            className="mt-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
          >
            Simple Payment Process
          </h2>
          <p className="mt-4 text-muted-foreground">
            Seamless payment process. We accept payments in crypto, or you can use your
            credit/debit card to buy the crypto in 3 min - no KYC.
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
          className="mt-12 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/shop">
              Shop products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full whitespace-normal text-center sm:w-auto sm:whitespace-nowrap">
            <a href={ONRAMP_URL} target="_blank" rel="noopener noreferrer">
              Open Guardarian (card → crypto)
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
