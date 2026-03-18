import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPublishedBlogPosts, excerptFromHtml } from '@/lib/blog';
import { ArrowRight, Calendar, FileText } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog – Nootropics & Cognitive Enhancement',
  description:
    'Insights, guides, and news about cognitive enhancement, nootropics, Modafinil, Armodafinil, and peak mental performance. Noofox blog.',
  openGraph: {
    title: 'Blog | Noofox – Nootropics & Cognitive Enhancement',
    description:
      'Insights, guides, and news about cognitive enhancement, nootropics, and peak mental performance.',
    url: `${BASE}/blog`,
    siteName: 'Noofox',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Noofox – Nootropics & Cognitive Enhancement',
    description: 'Insights, guides, and news about cognitive enhancement and nootropics.',
    creator: '@Noofox',
  },
  alternates: { canonical: `${BASE}/blog` },
};

/** Approximate reading time in minutes from HTML content length. */
function readingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogListPage() {
  const posts = await getPublishedBlogPosts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Noofox Blog',
    description:
      'Insights, guides, and news about cognitive enhancement, nootropics, and peak mental performance.',
    url: `${BASE}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Noofox',
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
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 lg:px-8">
        {/* Hero — SEO Sherpa style: clear title + tagline */}
        <header className="border-b border-border pb-10 sm:pb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            The Noofox blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            Grow your knowledge with guides and insights on nootropics, cognitive enhancement, and
            peak mental performance.
          </p>
        </header>

        {/* Posts list — editorial single column with cards */}
        <div className="mt-10 sm:mt-12">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 py-16 px-6 text-center sm:py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                No posts yet
              </h2>
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
            <ul className="divide-y divide-border">
              {posts.map((post) => {
                const excerpt = excerptFromHtml(post.content, 180);
                const date = new Date(post.created_at);
                const readMin = readingTimeMinutes(post.content);
                return (
                  <li key={post.id}>
                    <article className="group py-8 first:pt-0 sm:py-10">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block transition-colors hover:opacity-90"
                      >
                        <time
                          dateTime={date.toISOString()}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Calendar className="h-4 w-4 shrink-0" />
                          {date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          <span className="text-border">·</span>
                          <span>{readMin} min read</span>
                        </time>
                        <h2 className="mt-2 text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                          {post.title}
                        </h2>
                        {excerpt && (
                          <p className="mt-3 line-clamp-3 text-muted-foreground sm:text-base">
                            {excerpt}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                          Read post
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {posts.length > 0 && (
          <div className="mt-12 flex justify-center border-t border-border pt-8">
            <Button variant="outline" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
