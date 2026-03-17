import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getBlogPostBySlug,
  getPublishedBlogSlugs,
  excerptFromHtml,
} from '@/lib/blog';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

export const dynamic = 'force-dynamic';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com';

type PageParams = { slug: string };

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getPublishedBlogSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const description = excerptFromHtml(post.content, 160);
  const url = `${BASE}/blog/${post.slug}`;
  return {
    title: post.title,
    description: description || post.title,
    openGraph: {
      title: post.title,
      description: description || post.title,
      url,
      siteName: 'Noofox',
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description || post.title,
      creator: '@Noofox',
    },
    alternates: { canonical: url },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const safeContent = sanitizeHtml(post.content);
  const datePublished = new Date(post.created_at);
  const dateModified = new Date(post.updated_at);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: excerptFromHtml(post.content, 160) || post.title,
    url: `${BASE}/blog/${post.slug}`,
    datePublished: datePublished.toISOString(),
    dateModified: dateModified.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'Noofox',
      url: BASE,
    },
  };

  return (
    <div className="min-h-screen py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 lg:px-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <header className="mt-8">
          <Badge variant="secondary">Blog</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <time
            dateTime={datePublished.toISOString()}
            className="mt-4 flex items-center gap-2 text-muted-foreground"
          >
            <Calendar className="h-4 w-4 shrink-0" />
            {datePublished.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </header>

        <div
          className="rich-content mt-12"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </article>
    </div>
  );
}
