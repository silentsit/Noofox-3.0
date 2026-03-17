import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPublishedBlogPosts, excerptFromHtml } from '@/lib/blog';
import { ArrowRight, Calendar } from 'lucide-react';

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

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16 lg:px-8">
        {/* Header */}
        <header className="text-center">
          <Badge variant="secondary" className="mb-4">
            Blog
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Nootropics & Cognitive Enhancement
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Insights, guides, and news about cognitive enhancement, nootropics, and peak mental
            performance.
          </p>
        </header>

        {/* Posts list */}
        <div className="mt-12 sm:mt-16">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No posts yet. Check back soon.</p>
              <Button className="mt-4" asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:gap-10">
              {posts.map((post) => {
                const excerpt = excerptFromHtml(post.content, 155);
                const date = new Date(post.created_at);
                return (
                  <li key={post.id}>
                    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col p-6 sm:p-8">
                        <time
                          dateTime={date.toISOString()}
                          className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground"
                        >
                          <Calendar className="h-4 w-4 shrink-0" />
                          {date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                        <h2 className="text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                          {post.title}
                        </h2>
                        {excerpt && (
                          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground sm:text-base">
                            {excerpt}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                          Read more
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
      </div>
    </div>
  );
}
