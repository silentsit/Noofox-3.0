import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle, Truck, Shield, Clock, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductCard } from '@/components/products/ProductCard';
import { getCatalogProductBySlug, getCatalogProducts, getRelatedCatalogProducts } from '@/lib/catalog';
import { getCatalogProductImageUrl } from '@/lib/productImage';
import { productJsonLd } from '@/lib/schema';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com').replace(/\/$/, '');

export const dynamicParams = true;

type PageParams = {
  slug: string;
};

function buildSupplementalSchemas(product: NonNullable<Awaited<ReturnType<typeof getCatalogProductBySlug>>>) {
  const breadcrumbItems =
    product.breadcrumbs.length > 0
      ? product.breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.href.startsWith('http') ? crumb.href : `${SITE}${crumb.href}`,
        }))
      : [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE}/shop` },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `${SITE}${product.urlPath}`,
          },
        ];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems,
    },
  ];
}

export async function generateStaticParams() {
  const products = await getCatalogProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: {
      absolute: product.seo.title,
    },
    description: product.seo.description,
    alternates: {
      canonical: product.urlPath,
    },
    openGraph: {
      type: 'website',
      title: product.seo.openGraph.title || product.seo.title,
      description: product.seo.openGraph.description || product.seo.description,
      url: product.urlPath,
      siteName: product.seo.openGraph.siteName || 'GrabModa',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seo.twitter.title || product.seo.title,
      description: product.seo.twitter.description || product.seo.description,
      creator: product.seo.twitter.creator || '@GrabModa',
    },
    robots: product.seo.robots,
  };
}

export default async function ProductSlugPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedCatalogProducts(product, 4);
  const supplementalSchemas = buildSupplementalSchemas(product);
  const fromWoo = (product.structuredData ?? []).filter((entry) => {
    if (typeof entry !== 'object' || entry === null) return true;
    const t = (entry as Record<string, unknown>)['@type'];
    return t !== 'Product';
  });
  const schemas = [productJsonLd(product), ...fromWoo, ...supplementalSchemas];

  const heroImageUrl = getCatalogProductImageUrl(product, 0);
  const allImages = product.images?.length ? product.images : [];

  return (
    <div className="py-8 sm:py-12">
      {schemas.map((schema, index) => (
        <script
          key={`${product.slug}-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="block">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </nav>

        {/* Product Section */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative">
            <div className="lg:sticky lg:top-24">
              {allImages.length > 1 ? (
                <ProductImageGallery images={allImages} productName={product.name} />
              ) : (
                <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card">
                  {heroImageUrl ? (
                    <Image
                      src={heroImageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                      unoptimized={heroImageUrl.startsWith('http')}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary">
                          <span className="text-5xl font-bold text-primary-foreground">
                            {product.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">{product.name}</p>
                      </div>
                    </div>
                  )}
                  {product.reviewSummary.reviewCount > 10 && (
                    <Badge className="absolute left-4 top-4">Best Seller</Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <Badge variant="outline" className="capitalize">{product.category}</Badge>
              )}
              {product.reviewSummary.averageRating && (
                <Badge variant="outline">
                  {product.reviewSummary.averageRating.toFixed(1)} ({product.reviewSummary.reviewCount} reviews)
                </Badge>
              )}
            </div>

            <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {product.seo.description || product.shortDescriptionText}
            </p>

            <Separator className="my-8" />

            {/* Purchase Panel */}
            <ProductPurchasePanel product={product} />

            <Separator className="my-8" />

            {/* Trust Badges */}
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4">
                <Truck className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">Worldwide delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4">
                <Shield className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                <div>
                  <p className="text-sm font-medium">100% Authentic</p>
                  <p className="text-xs text-muted-foreground">Lab-tested quality</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4">
                <Clock className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                <div>
                  <p className="text-sm font-medium">Fast Processing</p>
                  <p className="text-xs text-muted-foreground">Ships within 24h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:p-4">
                <CheckCircle className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
                <div>
                  <p className="text-sm font-medium">Discreet Packaging</p>
                  <p className="text-xs text-muted-foreground">Privacy guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        {product.descriptionHtml && (
          <div className="mt-12 rounded-2xl border border-border bg-card p-4 sm:mt-16 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">Product Information</h2>
            <div
              className="rich-content mt-6"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>
        )}

        {/* FAQs */}
        {product.faqs.length > 0 && (
          <div className="mt-12 rounded-2xl border border-border bg-card p-4 sm:mt-16 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-xl">Frequently Asked Questions</h2>
            <div className="mt-6 space-y-4">
              {product.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl border border-border bg-background p-4"
                >
                  <summary className="cursor-pointer list-none font-medium text-sm">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-bold sm:text-2xl">Related Products</h2>
                <p className="mt-2 text-muted-foreground">
                  You may also like
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link href="/shop">View full catalog</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.slug} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
      </article>
    </div>
  );
}
