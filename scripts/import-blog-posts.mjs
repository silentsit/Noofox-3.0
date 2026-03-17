/**
 * Import blog posts from noofox.com into blog_posts table.
 * URL source (first wins): BLOG_URLS_FILE, BLOG_URLS, then sitemap_index.xml / post-sitemap.xml.
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, migrations 005 applied.
 *
 * Usage:
 *   node scripts/import-blog-posts.mjs
 *   BLOG_URLS_FILE=./scripts/noofox-blog-urls.txt node scripts/import-blog-posts.mjs
 *   BLOG_URLS=https://noofox.com/post1,https://noofox.com/post2 node scripts/import-blog-posts.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const USER_AGENT = 'Mozilla/5.0 (compatible; NoofoxImport/1.0)';

function fetchHtml(url) {
  try {
    return execFileSync('curl', ['-L', '--max-time', 30, '-A', USER_AGENT, url], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (e) {
    console.warn('Fetch failed:', url, e.message);
    return null;
  }
}

function slugFromUrl(url) {
  try {
    const path = new URL(url).pathname.replace(/^\/|\/$/g, '').replace(/\/$/, '');
    return path || 'post';
  } catch {
    return 'post';
  }
}

function getTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  return m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function getContent(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    || html.match(/<div[^>]+class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    || html.match(/<div[^>]+class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (main) return main[1].trim();
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return body ? body[1].trim() : html;
}

function getUrlsFromFile(filePath) {
  const resolved = resolve(process.cwd(), filePath);
  if (!existsSync(resolved)) return null;
  const text = readFileSync(resolved, 'utf8');
  return text
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter((u) => u && (u.startsWith('http://') || u.startsWith('https://')));
}

function extractUrlsFromXml(xml) {
  const locs = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return locs.map((l) => l.replace(/<\/?loc>/g, '').trim());
}

async function getPostUrls() {
  const filePath = process.env.BLOG_URLS_FILE;
  if (filePath) {
    const urls = getUrlsFromFile(filePath);
    if (urls && urls.length) {
      console.log(`Using ${urls.length} URL(s) from ${filePath}`);
      return urls;
    }
  }

  const fromEnv = process.env.BLOG_URLS;
  if (fromEnv) {
    const urls = fromEnv.split(',').map((u) => u.trim()).filter(Boolean);
    if (urls.length) return urls;
  }

  const base = process.env.NOOFOX_SOURCE_URL || 'https://noofox.com';
  const sitemapUrls = [
    `${base}/sitemap_index.xml`,
    `${base}/sitemap-index.xml`,
    `${base}/post-sitemap.xml`,
    `${base}/wp-sitemap-posts-post-1.xml`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    const index = fetchHtml(sitemapUrl);
    if (!index) continue;

    const urls = extractUrlsFromXml(index);
    if (!urls.length) continue;

    const isIndexSitemap = /sitemap_index|sitemap-index/.test(sitemapUrl);
    const looksLikeSitemap = (u) => /\.xml(\?|$)/i.test(u) || /sitemap|wp-sitemap/.test(u);

    if (isIndexSitemap) {
      const subSitemaps = urls.filter((u) => looksLikeSitemap(u) && (u.includes('post') || u.includes('blog')));
      for (const sub of subSitemaps) {
        const xml = fetchHtml(sub);
        if (!xml) continue;
        const postUrls = extractUrlsFromXml(xml).filter((u) => !looksLikeSitemap(u));
        if (postUrls.length) {
          console.log(`Found ${postUrls.length} URL(s) from ${sub}`);
          return postUrls;
        }
      }
    } else {
      const postUrls = urls.filter((u) => !looksLikeSitemap(u));
      if (postUrls.length) {
        console.log(`Found ${postUrls.length} URL(s) from ${sitemapUrl}`);
        return postUrls;
      }
    }
  }

  console.warn('No sitemap or URL list found. Set BLOG_URLS_FILE or BLOG_URLS.');
  return [];
}

async function run() {
  const urls = await getPostUrls();
  console.log(`Found ${urls.length} post URL(s).`);

  for (const url of urls) {
    const slug = slugFromUrl(url);
    const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).single();
    if (existing) {
      console.log(`  Skip (exists): ${slug}`);
      continue;
    }

    const html = fetchHtml(url);
    if (!html) continue;

    const title = getTitle(html) || slug;
    const content = getContent(html) || '';

    const { error } = await supabase.from('blog_posts').insert({
      title,
      slug,
      content,
      author_id: null,
      published: true,
    });
    if (error) {
      console.error(`  Error ${slug}:`, error.message);
      continue;
    }
    console.log(`  OK: ${slug}`);
  }
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
