import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <div className="py-12">
      <article className="mx-auto max-w-3xl px-4 lg:px-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <header className="mt-8">
          <Badge variant="secondary">Blog</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        <div
          className="rich-content mt-12"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </article>
    </div>
  );
}
