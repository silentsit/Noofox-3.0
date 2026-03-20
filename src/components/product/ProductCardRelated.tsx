'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { CatalogProduct } from '@/types/catalog';
import { getCatalogProductImageUrl } from '@/lib/productImage';
import { Plane, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardRelatedProps {
  product: CatalogProduct;
  /** Optional: show "Best Seller" or "Popular" badge */
  badge?: 'best-seller' | 'popular' | null;
}

export function ProductCardRelated({ product, badge = null }: ProductCardRelatedProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const imageUrl = getCatalogProductImageUrl(product, 0);
  const variant = product.variants[selectedIndex] ?? product.variants[0];
  const price = variant ? variant.price : product.priceRange.min;
  const shortDesc = product.shortDescriptionText?.replace(/<[^>]*>/g, '').slice(0, 100) ?? '';
  const truncated = shortDesc.length >= 100 ? `${shortDesc.slice(0, 97)}...` : shortDesc;

  const productHref = product.urlPath.startsWith('/') ? product.urlPath : `/${product.urlPath}`;

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    setBusy(true);
    addItem({
      product_id: `${product.slug}::${variant.id}`,
      name: `${product.name} - ${variant.label}`,
      price: variant.price,
      quantity: 1,
      image_url: imageUrl ?? '',
    });
    router.push('/checkout');
  }

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-surface-200/80 bg-[#faf8f5] shadow-sm">
      <Link href={productHref} className="relative block min-h-[44px]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f6f0e7]">
          {imageUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                unoptimized={imageUrl.startsWith('http')}
                sizes="(max-width: 640px) 100vw, 280px"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-surface-400">
              Product image
            </div>
          )}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow">
            <Plane className="h-3.5 w-3.5" aria-hidden />
            FREE SHIPPING
          </div>
          {badge === 'best-seller' && (
            <div className="absolute left-3 top-12 rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow">
              Best Seller
            </div>
          )}
          {badge === 'popular' && (
            <div className="absolute left-3 top-12 rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow">
              Popular
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link href={productHref} className="block min-h-[44px]">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            {product.category ?? 'Nootropics'}
          </p>
          <h2 className="mt-1.5 break-words text-lg font-bold leading-tight text-surface-900">
            {product.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-snug text-surface-600">
            {truncated || product.seo?.description || 'Premium nootropic.'}
          </p>
        </Link>

        <div className="mt-3 flex flex-wrap gap-2">
          {variant && (
            <span className="rounded-lg border border-surface-200 bg-surface-100 px-2.5 py-1 text-xs text-surface-700">
              {variant.quantityText}
            </span>
          )}
          <span className="rounded-lg border border-surface-200 bg-surface-100 px-2.5 py-1 text-xs text-surface-700">
            Noofox
          </span>
        </div>

        {product.variants.length > 1 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-surface-600">Select quantity</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.slice(0, 6).map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedIndex(i)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    i === selectedIndex
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300'
                  }`}
                >
                  {v.quantityText}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xl font-bold text-surface-900">${price.toFixed(2)} USD</span>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={busy || !variant}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-500 disabled:opacity-60"
          >
            <Zap className="h-4 w-4" aria-hidden />
            {busy ? 'Redirecting…' : 'Buy now'}
          </button>
        </div>
      </div>
    </article>
  );
}
