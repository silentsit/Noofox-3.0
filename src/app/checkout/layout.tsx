import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Checkout - contact, shipping, payment (card, Revolut, or crypto wallet), and order summary.',
  alternates: { canonical: `${BASE}/checkout` },
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
