/**
 * Blog data layer: published posts ship from `src/data/noofox-blog-posts.json`
 * (synced from noofox.com WordPress). Admin CRUD still uses Supabase when configured.
 */

import type { BlogPost } from '@/types/blog';
import rawBlogPosts from '@/data/noofox-blog-posts.json';
import { createClient } from '@/lib/supabase/server';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Blog taxonomy: three core topics (matches /blog?category= filters). */
export type BlogCategorySlug =
  | 'cognitive-enhancement'
  | 'meditation'
  | 'repurposed-medication';

export const BLOG_CATEGORY_SLUGS: BlogCategorySlug[] = [
  'cognitive-enhancement',
  'meditation',
  'repurposed-medication',
];

/** Human-readable label for a category slug (UI + cards). */
export function blogCategoryLabel(slug: BlogCategorySlug): string {
  switch (slug) {
    case 'meditation':
      return 'Meditation';
    case 'repurposed-medication':
      return 'Repurposed Medication';
    default:
      return 'Cognitive Enhancement';
  }
}

/** Infer category from slug (heuristic for imported / legacy posts without a DB column). */
export function inferBlogCategory(slug: string): BlogCategorySlug {
  const s = slug.toLowerCase();
  if (
    s.includes('dmt') ||
    s.includes('meditation') ||
    s.includes('ho-oponopono') ||
    s.includes('oponopono')
  ) {
    return 'meditation';
  }
  if (s.includes('viagra')) return 'repurposed-medication';
  return 'cognitive-enhancement';
}

function rewriteImportedBlogHtml(html: string, blogSlugs: Set<string>): string {
  let h = html.replace(/https:\/\/noofoxxx\.local\//g, 'https://grabmoda.com/');
  for (const slug of blogSlugs) {
    h = h.replace(
      new RegExp(`https://noofox\\.com/${escapeRegex(slug)}/`, 'g'),
      `/blog/${slug}/`
    );
  }
  return h;
}

const RAW: BlogPost[] = rawBlogPosts as BlogPost[];
const BLOG_SLUG_SET = new Set(RAW.map((p) => p.slug));

const PUBLISHED_POSTS: BlogPost[] = RAW.map((p) => ({
  ...p,
  content: rewriteImportedBlogHtml(p.content, BLOG_SLUG_SET),
})).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

export async function getPublishedBlogSlugs(): Promise<{ slug: string }[]> {
  return PUBLISHED_POSTS.map((p) => ({ slug: p.slug }));
}

/** For sitemap: slug + lastModified. */
export async function getPublishedBlogSlugsWithDates(): Promise<
  { slug: string; updated_at: string }[]
> {
  return PUBLISHED_POSTS.map((p) => ({ slug: p.slug, updated_at: p.updated_at }));
}

export async function getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  const list = [...PUBLISHED_POSTS];
  if (limit != null) return list.slice(0, limit);
  return list;
}

export async function getPublishedBlogPostsByCategory(
  category: BlogCategorySlug | null
): Promise<BlogPost[]> {
  if (!category) return getPublishedBlogPosts();
  return PUBLISHED_POSTS.filter((p) => inferBlogCategory(p.slug) === category);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = PUBLISHED_POSTS.find((p) => p.slug === slug);
  return post ?? null;
}

/** All blog posts for admin (includes unpublished). Requires admin role for RLS. */
export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data?.length) return [...PUBLISHED_POSTS];
    return data as BlogPost[];
  } catch {
    return [...PUBLISHED_POSTS];
  }
}

/** Single post by id for admin edit. */
export async function getAdminBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
    if (error || !data) {
      return PUBLISHED_POSTS.find((p) => p.id === id) ?? null;
    }
    return data as BlogPost;
  } catch {
    return PUBLISHED_POSTS.find((p) => p.id === id) ?? null;
  }
}

/**
 * First image URL from post HTML (`<img src>`, `data-src`, or first URL in `srcset`).
 * Used for blog cards and related posts thumbnails.
 */
export function getFirstImageUrlFromHtml(html: string): string | null {
  if (!html || typeof html !== 'string') return null;
  const imgTag = html.match(/<img\b[^>]*>/i)?.[0];
  if (!imgTag) return null;
  const src =
    imgTag.match(/\ssrc=["']([^"']+)["']/i)?.[1] ??
    imgTag.match(/\sdata-src=["']([^"']+)["']/i)?.[1];
  if (src) return normalizeBlogImageUrl(src);
  const srcset = imgTag.match(/\ssrcset=["']([^"']+)["']/i)?.[1];
  if (srcset) {
    const first = srcset
      .split(',')
      .map((s) => s.trim().split(/\s+/)[0])
      .filter(Boolean)[0];
    if (first) return normalizeBlogImageUrl(first);
  }
  return null;
}

function normalizeBlogImageUrl(url: string): string {
  return url
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .trim();
}

/** Other published posts (newest first), excluding the current slug. */
export async function getRelatedBlogPostsExcludingSlug(
  slug: string,
  limit: number = 3
): Promise<BlogPost[]> {
  return PUBLISHED_POSTS.filter((p) => p.slug !== slug).slice(0, limit);
}

/** Strip HTML and return plain text excerpt (max length). */
export function excerptFromHtml(html: string, maxLength: number = 160): string {
  const text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}
