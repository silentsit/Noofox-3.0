import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ShieldCheck, Star, Truck } from 'lucide-react';
import { ProductCardRelated } from '@/components/product/ProductCardRelated';
import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { getCatalogProductBySlug, getCatalogProducts, getRelatedCatalogProducts } from '@/lib/catalog';
import { getCatalogProductImageUrl } from '@/lib/productImage';

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
          item: crumb.href.startsWith('http') ? crumb.href : `https://noofox.com${crumb.href}`,
        }))
      : [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://noofox.com/' },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://noofox.com/shop' },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `https://noofox.com${product.urlPath}`,
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
      siteName: product.seo.openGraph.siteName || 'Noofox',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seo.twitter.title || product.seo.title,
      description: product.seo.twitter.description || product.seo.description,
      creator: product.seo.twitter.creator || '@Noofox',
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
  const schemas = [...(product.structuredData ?? []), ...supplementalSchemas];
  return (
    <ProductSlugContent
      product={product}
      relatedProducts={relatedProducts}
      schemas={schemas}
    />
  );
}

function ProductSlugContent({
  product,
  relatedProducts,
  schemas,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getCatalogProductBySlug>>>;
  relatedProducts: Awaited<ReturnType<typeof getRelatedCatalogProducts>>;
  schemas: unknown[];
}) {
  const heroImageUrl = getCatalogProductImageUrl(product, 0);
  const allImages = product.images?.length ? product.images : [];
  return (
    <div className="product-page-root bg-white min-h-screen">
      {schemas.map((schema, index) => (
        <script
          key={`${product.slug}-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="relative overflow-hidden bg-white text-surface-900">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-surface-200 to-transparent" />

        <section className="relative mx-auto max-w-7xl min-w-0 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-surface-500">
            <Link href="/" className="transition-colors hover:text-surface-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="transition-colors hover:text-surface-900">
              Shop
            </Link>
            <span>/</span>
            <span className="text-surface-900">{product.name}</span>
          </div>

          <div className="mt-8 sm:mt-10 grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,24rem)] lg:items-start">
            <div className="min-w-0">
              <div className="grid gap-6 sm:gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] xl:items-start">
                <div className="rounded-2xl sm:rounded-[2.25rem] border border-surface-200 bg-surface-50 p-4 sm:p-6 shadow-sm">
                  <div className="flex h-full min-h-[18rem] sm:min-h-[24rem] flex-col justify-between rounded-xl sm:rounded-[1.8rem] border border-surface-200 bg-white p-5 sm:p-8 relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
                      {heroImageUrl ? (
                        <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[10px] sm:text-xs uppercase tracking-[0.22em] text-brand-800">
                          {allImages.length > 1 ? `${allImages.length} images` : 'Product image'}
                        </span>
                      ) : (
                        <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[10px] sm:text-xs uppercase tracking-[0.22em] text-brand-800">
                          No image yet
                        </span>
                      )}
                      <span className="rounded-full border border-surface-200 bg-surface-100 px-2.5 py-1 text-[10px] sm:text-xs uppercase tracking-[0.22em] text-surface-600">
                        {product.category ?? 'Nootropic'}
                      </span>
                    </div>
                    {allImages.length > 1 ? (
                      <div className="relative z-10 mt-2">
                        <ProductImageGallery images={allImages} productName={product.name} />
                      </div>
                    ) : heroImageUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <Image
                          src={heroImageUrl}
                          alt={product.name}
                          fill
                          className="object-contain"
                          unoptimized={heroImageUrl.startsWith('http')}
                          sizes="(max-width: 1024px) 100vw, 480px"
                        />
                      </div>
                    ) : (
                      <div className="min-w-0 relative z-10">
                        <p className="text-xs uppercase tracking-[0.3em] text-surface-500">Live catalog import</p>
                        <p className="mt-4 sm:mt-5 font-display text-5xl sm:text-6xl lg:text-7xl leading-none text-surface-900 break-words">
                          {product.name
                            .split(' ')
                            .slice(0, 2)
                            .map((word) => word[0])
                            .join('')}
                        </p>
                        <p className="mt-6 max-w-md text-sm leading-7 text-surface-600">
                          Product data, long-form content, package pricing, meta tags, and structured data were
                          migrated from the live site. Images are intentionally deferred until your final assets
                          are ready.
                        </p>
                      </div>
                    )}
                    <div className="relative z-10">
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="rounded-xl sm:rounded-[1.25rem] border border-surface-200 bg-surface-50 p-3 sm:p-4 min-w-0">
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-surface-500">Starting at</p>
                          <p className="mt-1 sm:mt-2 text-base sm:text-xl font-semibold text-surface-900 truncate">${product.priceRange.min.toFixed(2)}</p>
                        </div>
                        <div className="rounded-xl sm:rounded-[1.25rem] border border-surface-200 bg-surface-50 p-3 sm:p-4 min-w-0">
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-surface-500">Packages</p>
                          <p className="mt-1 sm:mt-2 text-base sm:text-xl font-semibold text-surface-900">{product.variants.length}</p>
                        </div>
                        <div className="rounded-xl sm:rounded-[1.25rem] border border-surface-200 bg-surface-50 p-3 sm:p-4 min-w-0">
                          <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-surface-500">Reviews</p>
                          <p className="mt-1 sm:mt-2 text-base sm:text-xl font-semibold text-surface-900">{product.reviewSummary.reviewCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 min-w-0">
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-700">
                    {product.category ?? 'Premium nootropic'}
                  </p>
                  <h1 className="mt-4 sm:mt-5 font-display text-3xl leading-tight text-surface-900 xs:text-4xl sm:text-5xl lg:text-6xl break-words">
                    {product.name}
                  </h1>
                  <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg leading-7 sm:leading-8 text-surface-600">
                    {product.seo.description}
                  </p>

                  <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                      <Star className="h-4 w-4 fill-current" />
                      {product.reviewSummary.averageRating?.toFixed(1) ?? '5.0'} average from{' '}
                      {product.reviewSummary.reviewCount} reviews
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                      <ShieldCheck className="h-4 w-4" />
                      Transparent package pricing
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-800">
                      <Truck className="h-4 w-4" />
                      Discreet worldwide shipping
                    </div>
                  </div>

                  <div
                    className="rich-content mt-6 sm:mt-8 max-w-2xl text-surface-700 text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: product.shortDescriptionHtml }}
                  />
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 w-full">
              <ProductPurchasePanel product={product} />
            </div>
          </div>
        </section>
      </div>

      <section className="border-t border-surface-200 bg-[#f6f0e7] px-4 py-12 sm:py-16 text-surface-900 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-4 grid-cols-1 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-surface-300/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-surface-500">Trust cue</p>
            <h2 className="mt-3 font-display text-2xl text-surface-950">Upfront disclosure</h2>
            <p className="mt-3 text-sm leading-7 text-surface-600">
              The page surfaces exact package pricing, counts, and the migrated live-site copy before checkout.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-surface-300/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-surface-500">Trust cue</p>
            <h2 className="mt-3 font-display text-2xl text-surface-950">Evidence and reviews</h2>
            <p className="mt-3 text-sm leading-7 text-surface-600">
              Review volume and rating are made visible at the decision point instead of burying them below the fold.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-surface-300/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-surface-500">Trust cue</p>
            <h2 className="mt-3 font-display text-2xl text-surface-950">Assurance</h2>
            <p className="mt-3 text-sm leading-7 text-surface-600">
              Discreet shipping, support availability, and pricing clarity are repeated in context to reduce purchase doubt.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f0e7] px-4 pb-16 sm:pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl min-w-0 gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,22rem)]">
          <article className="rounded-2xl sm:rounded-[2rem] border border-surface-300/70 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10 min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-surface-500">Long-form content</p>
            <div
              className="rich-content mt-6"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </article>

          <aside className="space-y-6 min-w-0">
            <div className="rounded-2xl sm:rounded-[2rem] border border-surface-300/70 bg-white p-4 sm:p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <p className="text-xs uppercase tracking-[0.24em] text-surface-500">FAQ</p>
              <div className="mt-5 space-y-3">
                {product.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl sm:rounded-[1.25rem] border border-surface-200 bg-surface-50 px-3 sm:px-4 py-3"
                  >
                    <summary className="cursor-pointer list-none pr-6 font-medium text-surface-900 text-sm sm:text-base min-h-[44px] flex items-center">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-surface-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-surface-300/70 bg-[#081426] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-200">Why shoppers stay</p>
              <h2 className="mt-3 font-display text-3xl">Confidence without clutter</h2>
              <p className="mt-4 text-sm leading-7 text-surface-300">
                The layout intentionally combines premium depth, transparent detail, and visible reassurance so
                the page feels credible before it feels promotional.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-surface-200 bg-surface-100 px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-surface-500">You may also like</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl text-surface-950">Related products</h2>
            </div>
            <Link href="/shop" className="text-sm font-medium text-brand-700 hover:text-brand-800 min-h-[44px] flex items-center">
              View full catalog
            </Link>
          </div>

          <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct, i) => (
              <ProductCardRelated
                key={relatedProduct.slug}
                product={relatedProduct}
                badge={i === 0 ? 'best-seller' : i === 1 ? 'popular' : null}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
