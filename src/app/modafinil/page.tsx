import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { getCatalogProducts } from '@/lib/catalog';
import { getProductsBySilo } from '@/lib/catalogCategories';
import { breadcrumbListJsonLd, itemListJsonLd } from '@/lib/schema';

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';

export const metadata: Metadata = {
  title: 'Modafinil â€” Shop',
  description:
    'Browse premium Modafinil products: Modalert, Modvigil, Modaheal, and more. Lab-tested, worldwide shipping, crypto or card checkout.',
  alternates: { canonical: `${BASE}/modafinil` },
  openGraph: {
    title: 'Modafinil Products | GrabModa',
    description: 'Premium Modafinil cognitive enhancers with secure checkout.',
    url: `${BASE}/modafinil`,
    siteName: 'GrabModa',
    type: 'website',
  },
};

export default async function ModafinilCategoryPage() {
  const products = await getCatalogProducts();
  const modafinil = getProductsBySilo(products, 'modafinil');
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Modafinil', path: '/modafinil' },
  ]);
  const listLd = itemListJsonLd(
    'Modafinil',
    'Modafinil nootropics and wakefulness products.',
    '/modafinil',
    modafinil
  );

  return (
    <div className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/shop" className="hover:text-foreground">
                Shop
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground font-medium">Modafinil</li>
          </ol>
        </nav>

        <div className="mt-8 text-center sm:text-left">
          <Badge variant="secondary">Category</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Modafinil</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Generic Modafinil products for sustained focus and wakefulness. Choose your package and
            use <strong className="text-foreground">Buy now</strong> for a fast path to checkout.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/armodafinil">Armodafinil</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/blog">Related articles</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modafinil.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
