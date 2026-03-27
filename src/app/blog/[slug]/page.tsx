import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  getBlogPostBySlug,
  getPublishedBlogSlugs,
  excerptFromHtml,
  getFirstImageUrlFromHtml,
  getRelatedBlogPostsExcludingSlug,
} from '@/lib/blog';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { blogPostingJsonLd } from '@/lib/schema';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';

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
      siteName: 'GrabModa',
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description || post.title,
      creator: '@GrabModa',
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

  const relatedPosts = await getRelatedBlogPostsExcludingSlug(slug, 2);

  const safeContent = sanitizeHtml(post.content);
  const datePublished = new Date(post.created_at);
  const jsonLd = blogPostingJsonLd(post);

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

      {relatedPosts.length > 0 && (
        <div className="mx-auto mt-16 max-w-3xl px-4 lg:px-8">
          <Separator className="w-full" />
          <section className="mt-10" aria-labelledby="related-posts-heading">
            <h4
              id="related-posts-heading"
              className="font-display text-xl font-semibold tracking-tight text-foreground"
            >
              You May Like to Read
            </h4>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((related) => {
                const thumb = getFirstImageUrlFromHtml(related.content);
                const blurb = excerptFromHtml(related.content, 110);
                return (
                  <li key={related.id}>
                    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
                      <Link href={`/blog/${related.slug}`} className="flex flex-1 flex-col">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 360px"
                              unoptimized={thumb.startsWith('http') || thumb.includes('koala.sh')}
                            />
                          ) : (
                            <div className="flex h-full min-h-[10rem] items-center justify-center">
                              <FileText className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <h5 className="text-base font-semibold leading-snug text-foreground line-clamp-2 transition-colors hover:text-primary">
                            {related.title}
                          </h5>
                          {blurb && (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{blurb}</p>
                          )}
                          <span className="mt-3 text-sm font-medium text-primary">Read more</span>
                        </div>
                      </Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
