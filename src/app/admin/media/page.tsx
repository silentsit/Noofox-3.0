'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AdminMediaUpload } from '@/components/admin/AdminMediaUpload';
import { AdminMediaEditDialog } from '@/components/admin/AdminMediaEditDialog';
import type { Media } from '@/types/database';

export default function AdminMediaPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Media | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/media?limit=100');
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this image from the library and storage?')) return;
    const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    if (res.ok) setItems((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleSaveMeta(id: string, meta: { alt?: string; title?: string; caption?: string }) {
    const res = await fetch(`/api/admin/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meta),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setEditing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Media library</h1>
        <p className="mt-1 text-surface-500">
          Upload images and manage alt text, title, and caption for SEO.
        </p>
      </div>

      <AdminMediaUpload onUploaded={(m) => setItems((prev) => [m, ...prev])} />

      {loading ? (
        <p className="text-surface-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-surface-300 bg-surface-50 p-8 text-center text-surface-500">
          No images yet. Upload one above.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <li
              key={m.id}
              className="group relative overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm"
            >
              <div className="relative aspect-square bg-surface-100">
                <Image
                  src={m.url}
                  alt={m.alt ?? m.file_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                  unoptimized={m.url.startsWith('http')}
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-surface-900" title={m.file_name}>
                  {m.file_name}
                </p>
                {m.alt && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-surface-500">{m.alt}</p>
                )}
              </div>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditing(m)}
                  className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-surface-700 shadow hover:bg-white"
                >
                  Edit SEO
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <AdminMediaEditDialog
          media={editing}
          onClose={() => setEditing(null)}
          onSave={(meta) => handleSaveMeta(editing.id, meta)}
        />
      )}
    </div>
  );
}
