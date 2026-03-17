'use client';

import { useState, useEffect } from 'react';
import type { Media } from '@/types/database';

interface AdminMediaEditDialogProps {
  media: Media;
  onClose: () => void;
  onSave: (meta: { alt?: string; title?: string; caption?: string }) => void;
}

export function AdminMediaEditDialog({ media, onClose, onSave }: AdminMediaEditDialogProps) {
  const [alt, setAlt] = useState(media.alt ?? '');
  const [title, setTitle] = useState(media.title ?? '');
  const [caption, setCaption] = useState(media.caption ?? '');

  useEffect(() => {
    setAlt(media.alt ?? '');
    setTitle(media.title ?? '');
    setCaption(media.caption ?? '');
  }, [media]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ alt: alt || undefined, title: title || undefined, caption: caption || undefined });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-surface-200 p-4">
          <h2 className="text-lg font-semibold text-surface-900">Edit image SEO</h2>
          <p className="mt-0.5 text-sm text-surface-500">{media.file_name}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label htmlFor="media-alt" className="block text-sm font-medium text-surface-700">
              Alt text
            </label>
            <input
              id="media-alt"
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image for accessibility and SEO"
              className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="media-title" className="block text-sm font-medium text-surface-700">
              Title
            </label>
            <input
              id="media-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title (e.g. for tooltip)"
              className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="media-caption" className="block text-sm font-medium text-surface-700">
              Caption
            </label>
            <textarea
              id="media-caption"
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional caption"
              className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-surface-300 bg-white px-4 py-2 font-medium text-surface-700 hover:bg-surface-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
