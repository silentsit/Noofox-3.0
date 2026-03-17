import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPublishedBlogPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog',
  description: 'Noofox blog: nootropics, cognitive enhancement, and community insights.',
};

export default async function BlogListPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary">Blog</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Nootropics & Cognitive Enhancement
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Insights, guides, and news about cognitive enhancement, nootropics, and peak mental performance.
          </p>
        </div>

        {/* Posts */}
        <div className="mt-12">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No posts yet. Check back soon.</p>
              <Button className="mt-4" asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h2 className="text-xl font-semibold transition-colors group-hover:text-primary">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
