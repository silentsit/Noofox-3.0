import Link from 'next/link';
import { getAdminBlogPosts } from '@/lib/blog';
import { requireAdminPage } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  await requireAdminPage({ action: 'read', resource: 'blog' });
  const posts = await getAdminBlogPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Blog posts</h1>
          <p className="mt-1 text-surface-500">Create and edit blog posts with the rich text editor.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700"
        >
          New post
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-surface-200">
          <thead className="bg-surface-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                Slug
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 bg-white">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-surface-50">
                <td className="px-4 py-3 text-sm font-medium text-surface-900 sm:px-6">
                  {post.title}
                </td>
                <td className="px-4 py-3 text-sm text-surface-600 sm:px-6">{post.slug}</td>
                <td className="px-4 py-3 text-sm sm:px-6">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      post.published ? 'bg-green-100 text-green-800' : 'bg-surface-100 text-surface-600'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-surface-500 sm:px-6">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm sm:px-6">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="font-medium text-brand-600 hover:text-brand-700"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="px-6 py-12 text-center text-surface-500">
            No posts. <Link href="/admin/blog/new" className="text-brand-600 hover:text-brand-700">Create one</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
