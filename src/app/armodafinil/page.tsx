import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { getCatalogProducts } from '@/lib/catalog';
import { getProductsBySilo } from '@/lib/catalogCategories';
import { breadcrumbListJsonLd, itemListJsonLd } from '@/lib/schema';

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com';

export const metadata: Metadata = {
  title: 'Armodafinil — Shop',
  description:
    'Browse premium Armodafinil: Waklert, Artvigil, ArmodaXL, and more. Secure crypto or card checkout.',
  alternates: { canonical: `${BASE}/armodafinil` },
  openGraph: {
    title: 'Armodafinil Products | Noofox',
    description: 'Premium Armodafinil for clean, long-lasting focus.',
    url: `${BASE}/armodafinil`,
    siteName: 'Noofox',
    type: 'website',
  },
};

export default async function ArmodafinilCategoryPage() {
  const products = await getCatalogProducts();
  const armodafinil = getProductsBySilo(products, 'armodafinil');
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Armodafinil', path: '/armodafinil' },
  ]);
  const listLd = itemListJsonLd(
    'Armodafinil',
    'Armodafinil wakefulness and focus products.',
    '/armodafinil',
    armodafinil
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
            <li className="text-foreground font-medium">Armodafinil</li>
          </ol>
        </nav>

        <div className="mt-8 text-center sm:text-left">
          <Badge variant="secondary">Category</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Armodafinil</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            The R-enantiomer of Modafinil — often preferred for smooth, long-lasting alertness.
            Select a product and continue with <strong className="text-foreground">Buy now</strong>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/modafinil">Modafinil</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/blog">Related articles</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {armodafinil.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
