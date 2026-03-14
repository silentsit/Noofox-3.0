/**
 * Sync product descriptions (and optional content) from noofoxxx.local into Supabase.
 * Run locally where noofoxxx.local resolves:
 *   node --env-file=.env.local scripts/sync-product-content-from-noofoxxx.mjs
 *   npm run sync:noofoxxx
 *
 * Uses:
 * - http://noofoxxx.local/sitemap_index.xml to discover product URLs
 * - Each product page HTML to extract main content
 * - Supabase to update product descriptions by matching name/slug
 *
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY if RLS allows)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.local if present (when not using node --env-file)
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const BASE = 'http://noofoxxx.local';
const SITEMAP_URL = `${BASE}/sitemap_index.xml`;

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'NoofoxSync/1.0' } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

function extractLocUrls(xml) {
  const locs = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) locs.push(m[1].trim());
  return locs;
}

function stripHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract main content from product page: first <main>, or .product, or .entry-content, or body */
function extractMainContent(html) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    || html.match(/class="[^"]*product[^"]*"[\s\S]*?>([\s\S]{100,}?)<(?:div|section|footer)/i)
    || html.match(/class="[^"]*entry-content[^"]*"[\s\S]*?>([\s\S]*?)<\/(?:div|article)/i);
  const block = mainMatch ? mainMatch[1] : html.replace(/<head[\s\S]*?<\/head>/i, '');
  return stripHtml(block).slice(0, 4000);
}

/** Normalize product name to slug for matching URL */
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local');
    process.exit(1);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Fetching sitemap:', SITEMAP_URL);
  let sitemapXml;
  try {
    sitemapXml = await fetchText(SITEMAP_URL);
  } catch (e) {
    console.error('Could not fetch sitemap. Is noofoxxx.local running?', e.message);
    process.exit(1);
  }

  const urls = extractLocUrls(sitemapXml);
  const productUrls = urls.filter((u) => {
    const path = new URL(u).pathname;
    return path.includes('product') || path.includes('shop') || /\/[a-z0-9-]+\/?$/i.test(path);
  });
  if (productUrls.length === 0) {
    console.log('No product-like URLs in sitemap. Using all non-index URLs.');
    productUrls.push(...urls.filter((u) => !/\/?$/.test(new URL(u).pathname)));
  }
  console.log('Product URLs to fetch:', productUrls.length);

  const { data: products } = await supabase.from('products').select('id, name, description');
  if (!products?.length) {
    console.log('No products in DB. Run supabase/seed_neurovita_products.sql first.');
    process.exit(0);
  }

  const bySlug = {};
  products.forEach((p) => {
    bySlug[nameToSlug(p.name)] = p;
  });

  let updated = 0;
  for (const url of productUrls) {
    try {
      const html = await fetchText(url);
      const content = extractMainContent(html);
      if (content.length < 50) continue;

      const path = new URL(url).pathname;
      const pathSlug = path.replace(/^\/|\/$/g, '').split('/').pop() || path;
      let product = bySlug[pathSlug]
        || products.find((p) => pathSlug === nameToSlug(p.name))
        || products.find((p) => nameToSlug(p.name).includes(pathSlug) || pathSlug.includes(nameToSlug(p.name)));
      if (!product) continue;

      const { error } = await supabase
        .from('products')
        .update({ description: content })
        .eq('id', product.id);
      if (error) {
        console.warn('Update failed for', product.name, error.message);
      } else {
        console.log('Updated:', product.name);
        updated++;
      }
    } catch (e) {
      console.warn('Skip', url, e.message);
    }
  }

  console.log('Done. Updated', updated, 'products.');
}

main();
