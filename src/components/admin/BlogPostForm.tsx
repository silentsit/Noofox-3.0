'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TiptapEditor } from './TiptapEditor';
import type { BlogPost } from '@/types/blog';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

interface BlogPostFormProps {
  initialPost?: BlogPost | null;
}

export function BlogPostForm({ initialPost = null }: BlogPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title ?? '');
  const [slug, setSlug] = useState(initialPost?.slug ?? '');
  const [content, setContent] = useState(initialPost?.content ?? '');
  const [published, setPublished] = useState(initialPost?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (t: string) => {
    setTitle(t);
    if (!initialPost || slug === initialPost.slug) setSlug(slugify(t) || slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = initialPost ? `/api/admin/blog/${initialPost.id}` : '/api/admin/blog';
      const method = initialPost ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, content, published }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data.error as string) || 'Failed to save');
        return;
      }
      router.push('/admin/blog');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-surface-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-surface-700">
          Slug (URL)
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <p className="mt-1 text-xs text-surface-500">Used in URL: /blog/{slug || '...'}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">Content</label>
        <TiptapEditor content={content} onChange={setContent} placeholder="Write your post..." />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="published" className="text-sm text-surface-700">
          Published (visible on blog)
        </label>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : initialPost ? 'Update post' : 'Create post'}
        </button>
        <Link
          href="/admin/blog"
          className="rounded-lg border border-surface-300 bg-white px-4 py-2.5 font-medium text-surface-700 hover:bg-surface-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
