import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPostBySlug } from '@/lib/blog';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

export const dynamic = 'force-dynamic';

type PageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.title,
    openGraph: { title: post.title },
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

  return (
    <div className="min-h-screen bg-[#f6f0e7] text-surface-900">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-8 text-sm text-surface-500">
          <Link href="/blog" className="hover:text-brand-600">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-surface-700">{post.title}</span>
        </nav>

        <header className="mb-10">
          <h1 className="font-display text-3xl font-bold text-surface-900 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-surface-500">
            {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        <div
          className="rich-content prose prose-surface max-w-none"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </article>
    </div>
  );
}
