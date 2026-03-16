import { MetadataRoute } from 'next';
import { getCatalogProducts } from '@/lib/catalog';
import { getPublishedBlogSlugs } from '@/lib/blog';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogSlugs] = await Promise.all([
    getCatalogProducts(),
    getPublishedBlogSlugs(),
  ]);

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/checkout`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...products.map((product) => ({
      url: `${BASE}${product.urlPath}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...blogSlugs.map(({ slug }) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
