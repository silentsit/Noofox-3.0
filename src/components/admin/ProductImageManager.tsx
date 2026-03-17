'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { ProductImageMeta } from '@/types/database';

export interface ProductImageItem {
  url: string;
  alt?: string;
  title?: string;
}

interface ProductImageManagerProps {
  images: string[];
  imageMeta: ProductImageMeta;
  onChange: (images: string[], imageMeta: ProductImageMeta) => void;
}

export function ProductImageManager({ images, imageMeta, onChange }: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showAddUrl, setShowAddUrl] = useState(false);

  function getMeta(url: string): { alt?: string; title?: string } {
    return imageMeta[url] ?? {};
  }

  function setMeta(url: string, meta: { alt?: string; title?: string }) {
    const next = { ...imageMeta };
    if (meta.alt === undefined && meta.title === undefined) {
      delete next[url];
    } else {
      next[url] = { ...next[url], ...meta };
    }
    onChange(images, next);
  }

  function removeImage(url: string) {
    onChange(
      images.filter((u) => u !== url),
      (() => {
        const next = { ...imageMeta };
        delete next[url];
        return next;
      })()
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    const next = [...images];
    const j = index + direction;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next, imageMeta);
  }

  function addUrl() {
    const u = urlInput.trim();
    if (!u) return;
    if (images.includes(u)) return;
    onChange([...images, u], imageMeta);
    setUrlInput('');
    setShowAddUrl(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    const formData = new FormData();
    formData.set('file', file);
    const res = await fetch('/api/admin/media/upload', { method: 'POST', body: formData });
    setUploading(false);
    if (!res.ok) return;
    const data = await res.json();
    onChange([...images, data.url], imageMeta);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-surface-700">Product images</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded border border-surface-300 bg-white px-2.5 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          type="button"
          onClick={() => setShowAddUrl((v) => !v)}
          className="rounded border border-surface-300 bg-white px-2.5 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-50"
        >
          Add URL
        </button>
      </div>

      {showAddUrl && (
        <div className="flex gap-2 rounded-lg border border-surface-200 bg-surface-50 p-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://…"
            className="flex-1 rounded border border-surface-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addUrl}
            className="rounded bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowAddUrl(false); setUrlInput(''); }}
            className="rounded border border-surface-300 px-3 py-2 text-sm text-surface-700"
          >
            Cancel
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {images.map((url, index) => (
          <li
            key={url}
            className="flex flex-wrap items-start gap-3 rounded-lg border border-surface-200 bg-white p-3"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-surface-100">
              <Image
                src={url}
                alt={getMeta(url).alt ?? ''}
                fill
                className="object-cover"
                unoptimized={url.startsWith('http')}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="%23eee" width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10">No image</text></svg>';
                }}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <input
                type="text"
                value={getMeta(url).alt ?? ''}
                onChange={(e) => setMeta(url, { ...getMeta(url), alt: e.target.value })}
                placeholder="Alt text (SEO)"
                className="block w-full rounded border border-surface-300 px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                value={getMeta(url).title ?? ''}
                onChange={(e) => setMeta(url, { ...getMeta(url), title: e.target.value })}
                placeholder="Title (optional)"
                className="block w-full rounded border border-surface-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => moveImage(index, -1)}
                disabled={index === 0}
                className="rounded border border-surface-300 px-2 py-1 text-xs disabled:opacity-40"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveImage(index, 1)}
                disabled={index === images.length - 1}
                className="rounded border border-surface-300 px-2 py-1 text-xs disabled:opacity-40"
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      {images.length === 0 && (
        <p className="text-sm text-surface-500">No images. Upload one or add a URL.</p>
      )}
    </div>
  );
}
