'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Product } from '@/types/database';

interface ProductFormProps {
  className?: string;
  product?: Product | null;
}

export function ProductForm({ className = '', product }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price != null ? String(product.price) : '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [imagesStr, setImagesStr] = useState(
    product?.images?.length ? product.images.join('\n') : ''
  );
  const [stockCount, setStockCount] = useState(
    product?.stock_count != null ? String(product.stock_count) : '0'
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const images = imagesStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      name,
      price: parseFloat(price) || 0,
      description: description || null,
      images,
      stock_count: parseInt(stockCount, 10) || 0,
    };

    const url = product
      ? `/api/admin/products/${product.id}`
      : '/api/admin/products';
    const method = product ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage({ type: 'error', text: (err as { error?: string }).error ?? 'Failed to save.' });
      return;
    }
    setMessage({ type: 'success', text: product ? 'Product updated.' : 'Product created.' });
    if (!product) router.push('/admin/products');
    else router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-surface-700">
          Title
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-surface-700">
          Price
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-surface-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="images" className="block text-sm font-medium text-surface-700">
          Image URLs (one per line)
        </label>
        <textarea
          id="images"
          rows={3}
          value={imagesStr}
          onChange={(e) => setImagesStr(e.target.value)}
          placeholder="https://example.com/image1.jpg"
          className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="stock_count" className="block text-sm font-medium text-surface-700">
          Stock count
        </label>
        <input
          id="stock_count"
          type="number"
          min="0"
          value={stockCount}
          onChange={(e) => setStockCount(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : product ? 'Update product' : 'Create product'}
        </button>
        {product && (
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="rounded-lg border border-surface-300 bg-white px-4 py-2.5 font-medium text-surface-700 hover:bg-surface-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
