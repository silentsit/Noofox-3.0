import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Noofox — customer support and order questions.',
  alternates: { canonical: `${BASE}/contact` },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
