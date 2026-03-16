import Link from 'next/link';
import { getPublishedBlogPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog',
  description: 'Noofox blog: nootropics, cognitive enhancement, and community insights.',
};

export default async function BlogListPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="min-h-screen bg-[#f6f0e7] text-surface-900">
      <section className="border-b border-surface-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-3xl font-bold text-surface-900 sm:text-4xl">
            Blog
          </h1>
          <p className="mt-2 text-surface-500">
            Nootropics, cognitive enhancement, and community insights.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {posts.length === 0 ? (
            <p className="text-surface-500">No posts yet. Check back soon.</p>
          ) : (
            <ul className="space-y-8">
              {posts.map((post) => (
                <li key={post.id}>
                  <article className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <Link href={`/blog/${post.slug}`} className="block">
                      <h2 className="font-display text-xl font-semibold text-surface-900 hover:text-brand-600">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-sm text-surface-500">
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
