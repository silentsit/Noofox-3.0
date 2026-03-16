/**
 * Import blog posts from noofox.com into blog_posts table.
 * Fetches post URLs from sitemap or uses BLOG_URLS env (comma-separated).
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, migrations 005 applied.
 *
 * Usage: node scripts/import-blog-posts.mjs
 * Optional: BLOG_URLS=https://noofox.com/post1,https://noofox.com/post2
 */

import { createClient } from '@supabase/supabase-js';
import { execFileSync } from 'node:child_process';

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

async function getPostUrls() {
  const fromEnv = process.env.BLOG_URLS;
  if (fromEnv) return fromEnv.split(',').map((u) => u.trim()).filter(Boolean);

  try {
    const index = fetchHtml('https://noofox.com/sitemap_index.xml');
    if (!index) return [];
    const sitemaps = index.match(/<loc>([^<]+)<\/loc>/g) || [];
    const postUrls = [];
    for (const loc of sitemaps) {
      const url = loc.replace(/<\/?loc>/g, '');
      if (!url.includes('post') && !url.includes('blog')) continue;
      const xml = fetchHtml(url);
      if (!xml) continue;
      const locs = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
      for (const l of locs) postUrls.push(l.replace(/<\/?loc>/g, ''));
    }
    return postUrls;
  } catch (e) {
    console.warn('Sitemap fetch failed:', e.message);
  }
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
