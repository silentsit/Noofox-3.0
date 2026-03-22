import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';

export const metadata: Metadata = {
  title: 'Freebies',
  description:
    'Promotions and free Modafinil offers from GrabModa. Cheaper BuyModa alternative with worldwide shipping.',
  alternates: { canonical: `${BASE}/free-modafinil` },
};

export default function FreeModafinilPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">FREEBIES</h1>
      <p className="mt-4 text-muted-foreground">
        Promotional offers and free Modafinil programs — same positioning as the live promo page. Replace this
        copy with your live promotion details, eligibility, and terms.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/shop">Browse products</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
