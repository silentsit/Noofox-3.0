'use client';

import { useRef, useState } from 'react';
import type { Media } from '@/types/database';

interface AdminMediaUploadProps {
  onUploaded: (media: Media) => void;
}

export function AdminMediaUpload({ onUploaded }: AdminMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set('file', file);
    const res = await fetch('/api/admin/media/upload', { method: 'POST', body: formData });
    setUploading(false);
    e.target.value = '';
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? 'Upload failed');
      return;
    }
    const data = await res.json();
    onUploaded(data);
  }

  return (
    <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : 'Upload image'}
      </button>
      <p className="mt-2 text-xs text-surface-500">JPEG, PNG, GIF or WebP, max 10MB.</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
