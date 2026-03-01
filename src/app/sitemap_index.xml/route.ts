import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofoxxx.local';

export async function GET() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('id, updated_at').limit(5000);

  const urls: string[] = [
    BASE,
    `${BASE}/shop`,
    `${BASE}/about`,
    `${BASE}/shipping`,
    `${BASE}/checkout`,
    `${BASE}/login`,
  ];

  for (const p of products ?? []) {
    urls.push(`${BASE}/product/${p.id}`);
  }

  const lastMod = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE}/sitemap.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
