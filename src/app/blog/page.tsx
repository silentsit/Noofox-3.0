import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  BLOG_CATEGORY_SLUGS,
  getPublishedBlogPostsByCategory,
  excerptFromHtml,
  getFirstImageUrlFromHtml,
  inferBlogCategory,
  blogCategoryLabel,
  type BlogCategorySlug,
} from '@/lib/blog';
import { FileText } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grabmoda.com';
const POSTS_PER_PAGE = 10;

export const metadata: Metadata = {
  title: 'Blog â€“ Nootropics & Cognitive Enhancement',
  description:
    'Insights, guides, and news about cognitive enhancement, nootropics, Modafinil, Armodafinil, and peak mental performance. GrabModa blog.',
  openGraph: {
    title: 'Blog | GrabModa â€“ Nootropics & Cognitive Enhancement',
    description:
      'Insights, guides, and news about cognitive enhancement, nootropics, and peak mental performance.',
    url: `${BASE}/blog`,
    siteName: 'GrabModa',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | GrabModa â€“ Nootropics & Cognitive Enhancement',
    description: 'Insights, guides, and news about cognitive enhancement and nootropics.',
    creator: '@GrabModa',
  },
  alternates: { canonical: `${BASE}/blog` },
};

function blogListHref(pageNum: number, categoryFilter: BlogCategorySlug | null): string {
  const p = new URLSearchParams();
  if (pageNum > 1) p.set('page', String(pageNum));
  if (categoryFilter) p.set('category', categoryFilter);
  const q = p.toString();
  return q ? `/blog?${q}` : '/blog';
}

function readingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const { page: pageParam, category: categoryParam } = searchParams;
  const legacy = categoryParam === 'nootropics' || categoryParam === 'general';
  const normalized = legacy ? 'cognitive-enhancement' : categoryParam;
  const category: BlogCategorySlug | null =
    normalized === 'cognitive-enhancement' ||
    normalized === 'meditation' ||
    normalized === 'repurposed-medication'
      ? normalized
      : null;
  const posts = await getPublishedBlogPostsByCategory(category);
  const currentPage = Math.max(1, parseInt(String(pageParam), 10) || 1);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE) || 1;
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(start, start + POSTS_PER_PAGE);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'GrabModa Blog',
    description:
      'Insights, guides, and news about cognitive enhancement, nootropics, and peak mental performance.',
    url: `${BASE}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'GrabModa',
      url: BASE,
    },
    blogPost: posts.slice(0, 20).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${BASE}/blog/${post.slug}`,
      datePublished: post.created_at,
      dateModified: post.updated_at,
    })),
  };

  return (
    <div className="min-h-screen-safe w-full min-w-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 md:py-16 lg:px-8">
        {/* Blog index (reference layout) */}
        <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Blog
        </h1>

        {/* Category tabs: Cognitive Enhancement, Meditation, Repurposed Medication */}
        <nav className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4" aria-label="Blog categories">
          <Link
            href="/blog"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              !category
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </Link>
          {BLOG_CATEGORY_SLUGS.map((slug) => (
            <Link
              key={slug}
              href={`/blog?category=${slug}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                category === slug
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {blogCategoryLabel(slug)}
            </Link>
          ))}
        </nav>

        {/* Post grid — card layout */}
        <div className="mt-8">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 py-16 px-6 text-center sm:py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">No posts yet</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                We&apos;re preparing articles on nootropics, Modafinil, Armodafinil, and cognitive
                enhancement. Check back soon or explore our products.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild>
                  <Link href="/shop">Explore products</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Return home</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ul className="grid gap-8 sm:grid-cols-2">
                {paginatedPosts.map((post) => {
                  const excerpt = excerptFromHtml(post.content, 160);
                  const readMin = readingTimeMinutes(post.content);
                  const coverUrl = getFirstImageUrlFromHtml(post.content);
                  return (
                    <li key={post.id}>
                      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
                        <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
                          <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            {coverUrl ? (
                              <Image
                                src={coverUrl}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, 50vw"
                                unoptimized={
                                  coverUrl.startsWith('http') || coverUrl.includes('koala.sh')
                                }
                              />
                            ) : (
                              <div className="flex h-full min-h-[12rem] w-full items-center justify-center">
                                <FileText className="h-12 w-12 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <p className="text-xs text-muted-foreground">
                              {blogCategoryLabel(inferBlogCategory(post.slug))} / By GrabModa /{' '}
                              {readMin} minutes of reading
                            </p>
                            <h2 className="mt-2 text-lg font-semibold leading-tight text-foreground line-clamp-2">
                              {post.title}
                            </h2>
                            {excerpt && (
                              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                {excerpt}
                              </p>
                            )}
                            <span className="mt-4 text-sm font-medium text-primary">
                              Read More Â»
                            </span>
                          </div>
                        </Link>
                      </article>
                    </li>
                  );
                })}
              </ul>

              {/* Pagination: 1 2 Next â†’ */}
              {totalPages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2 border-t border-border pt-8" aria-label="Blog pagination">
                  {page > 1 && (
                    <Link
                      href={blogListHref(page - 1, category)}
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      â† Previous
                    </Link>
                  )}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={blogListHref(p, category)}
                        className={`min-w-[2.25rem] rounded-md px-2 py-2 text-center text-sm font-medium ${
                          p === page
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>
                  {page < totalPages && (
                    <Link
                      href={blogListHref(page + 1, category)}
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Next â†’
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
