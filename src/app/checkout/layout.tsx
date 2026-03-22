import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Checkout â€” contact, shipping, payment (card, Revolut, or crypto with 15% off), and order summary.',
  alternates: { canonical: `${BASE}/checkout` },
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
