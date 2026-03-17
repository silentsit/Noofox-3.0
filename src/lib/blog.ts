/**
 * Blog data layer: fetch published posts for sitemap and blog pages.
 * Uses Supabase; returns [] if table not yet migrated or on error.
 */

import { createClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/types/blog';

export async function getPublishedBlogSlugs(): Promise<{ slug: string }[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []).map((row) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

/** For sitemap: slug + lastModified. */
export async function getPublishedBlogSlugsWithDates(): Promise<
  { slug: string; updated_at: string }[]
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []).map((row) => ({ slug: row.slug, updated_at: row.updated_at }));
  } catch {
    return [];
  }
}

export async function getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (limit != null) query = query.limit(limit);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    if (error || !data) return null;
    return data as BlogPost;
  } catch {
    return null;
  }
}

/** All blog posts for admin (includes unpublished). Requires admin role for RLS. */
export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

/** Single post by id for admin edit. */
export async function getAdminBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as BlogPost;
  } catch {
    return null;
  }
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
