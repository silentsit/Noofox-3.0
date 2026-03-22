import type { CatalogProduct } from '@/types/catalog';
import type { BlogPost } from '@/types/blog';

import { SITE_LOGO_SRC } from '@/lib/branding';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';

function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.replace(/\/$/, '')}${p}`;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GrabModa',
    url: SITE,
    logo: `${SITE}${SITE_LOGO_SRC}`,
    sameAs: [] as string[],
  };
}

export function breadcrumbListJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: CatalogProduct) {
  const url = absoluteUrl(product.urlPath.replace(/\/$/, '') || `/${product.slug}`);
  const prices = product.variants.map((v) => v.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);

  const aggregateOffer = {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: low.toFixed(2),
    highPrice: high.toFixed(2),
    offerCount: product.variants.length,
    availability: product.variants.some((v) => v.inStock)
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url,
  };

  const aggregateRating =
    product.reviewSummary.averageRating != null && product.reviewSummary.reviewCount > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.reviewSummary.averageRating,
          reviewCount: product.reviewSummary.reviewCount,
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seo?.description || product.shortDescriptionText,
    sku: product.id,
    image: product.images?.[0] ? absoluteUrl(product.images[0]) : undefined,
    brand: {
      '@type': 'Brand',
      name: 'GrabModa',
    },
    offers: aggregateOffer,
    ...(aggregateRating ? { aggregateRating } : {}),
  };
}

export function itemListJsonLd(
  name: string,
  description: string,
  listPath: string,
  products: CatalogProduct[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url: absoluteUrl(listPath),
    numberOfItems: products.length,
    itemListElement: products.map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: p.name,
      item: absoluteUrl(p.urlPath.replace(/\/$/, '') || `/${p.slug}`),
    })),
  };
}

export function blogPostingJsonLd(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GrabModa',
      url: SITE,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}${SITE_LOGO_SRC}`,
      },
    },
    author: {
      '@type': 'Organization',
      name: 'GrabModa',
    },
  };
}
