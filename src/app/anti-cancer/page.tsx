import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';

export const metadata: Metadata = {
  title: 'Anti-Cancer',
  description: 'GrabModa category â€” coming soon.',
  alternates: { canonical: `${BASE}/anti-cancer` },
  robots: { index: true, follow: true },
};

export default function AntiCancerPage() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-2xl px-4 text-center lg:px-8">
        <Badge variant="secondary">Category</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Anti-Cancer</h1>
        <p className="mt-4 text-muted-foreground">
          This category is being prepared. Browse our current catalog of cognitive enhancers
          and check back for updates.
        </p>
        <Button asChild className="mt-8">
          <Link href="/shop">Go to shop</Link>
        </Button>
      </div>
    </div>
  );
}
