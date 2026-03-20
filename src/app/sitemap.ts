import { MetadataRoute } from 'next';
import { getCatalogProducts } from '@/lib/catalog';
import { getPublishedBlogSlugsWithDates } from '@/lib/blog';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogPosts] = await Promise.all([
    getCatalogProducts(),
    getPublishedBlogSlugsWithDates(),
  ]);

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/modafinil`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/armodafinil`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/anti-cancer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/skincare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
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
    ...blogPosts.map(({ slug, updated_at }) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: new Date(updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
