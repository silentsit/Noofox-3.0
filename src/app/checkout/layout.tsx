import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Noofox order — pay with crypto or card (via Guardarian on-ramp).',
  alternates: { canonical: `${BASE}/checkout` },
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
