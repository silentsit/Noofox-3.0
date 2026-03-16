import Link from 'next/link';
import { BlogPostForm } from '@/components/admin/BlogPostForm';

export const dynamic = 'force-dynamic';

export default function AdminBlogNewPage() {
  return (
    <div>
      <nav className="mb-6 text-sm text-surface-500">
        <Link href="/admin/blog" className="hover:text-brand-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-surface-700">New post</span>
      </nav>
      <h1 className="text-2xl font-semibold text-surface-900">New blog post</h1>
      <p className="mt-1 text-surface-500">Create a new post. Content is stored as HTML from the editor.</p>
      <BlogPostForm />
    </div>
  );
}
