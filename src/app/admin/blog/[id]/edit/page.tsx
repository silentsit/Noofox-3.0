import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminBlogPostById } from '@/lib/blog';
import { BlogPostForm } from '@/components/admin/BlogPostForm';

export const dynamic = 'force-dynamic';

type PageParams = { id: string };

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;
  const post = await getAdminBlogPostById(id);
  if (!post) notFound();

  return (
    <div>
      <nav className="mb-6 text-sm text-surface-500">
        <Link href="/admin/blog" className="hover:text-brand-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-surface-700">{post.title}</span>
      </nav>
      <h1 className="text-2xl font-semibold text-surface-900">Edit blog post</h1>
      <p className="mt-1 text-surface-500">Update title, slug, content, and publish status.</p>
      <BlogPostForm initialPost={post} />
    </div>
  );
}
