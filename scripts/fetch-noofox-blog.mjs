/**
 * Fetches published posts from noofox.com WordPress REST API and writes
 * src/data/noofox-blog-posts.json in BlogPost shape.
 *
 * Run: node scripts/fetch-noofox-blog.mjs
 */
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../src/data/noofox-blog-posts.json');

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 NoofoxSiteSync/1.0' } }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

const API =
  'https://noofox.com/wp-json/wp/v2/posts?per_page=100&status=publish&_fields=id,slug,title,content,date,modified';

async function main() {
  const wp = await fetchJson(API);
  if (!Array.isArray(wp)) throw new Error('Unexpected API response');

  const posts = wp.map((p) => {
    const created = p.date?.includes('T') ? `${p.date}Z` : p.date;
    const updated = p.modified?.includes('T') ? `${p.modified}Z` : p.modified || created;
    return {
      id: String(p.id),
      title: decodeHtmlEntities(p.title?.rendered ?? ''),
      slug: p.slug,
      content: p.content?.rendered ?? '',
      author_id: null,
      published: true,
      created_at: created,
      updated_at: updated,
    };
  });

  posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(posts, null, 0), 'utf8');
  console.log(`Wrote ${posts.length} posts to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
