'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CatalogProduct } from '@/types/catalog';
import { getCatalogProductImageUrl } from '@/lib/productImage';
import { Plane, ShoppingCart } from 'lucide-react';

interface ProductCardRelatedProps {
  product: CatalogProduct;
  /** Optional: show "Best Seller" or "Popular" badge */
  badge?: 'best-seller' | 'popular' | null;
}

export function ProductCardRelated({ product, badge = null }: ProductCardRelatedProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imageUrl = getCatalogProductImageUrl(product, 0);
  const variant = product.variants[selectedIndex] ?? product.variants[0];
  const price = variant ? variant.price : product.priceRange.min;
  const shortDesc = product.shortDescriptionText?.replace(/<[^>]*>/g, '').slice(0, 100) ?? '';
  const truncated = shortDesc.length >= 100 ? `${shortDesc.slice(0, 97)}...` : shortDesc;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-surface-200/80 bg-[#faf8f5] shadow-sm min-w-0">
      <Link href={product.urlPath} className="flex flex-col h-full min-h-[44px]">
        {/* Image area with badges */}
        <div className="relative aspect-[4/3] w-full bg-[#f6f0e7] overflow-hidden">
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
            <div className="absolute inset-0 flex items-center justify-center text-surface-400 text-sm">
              Product image
            </div>
          )}
          {/* FREE SHIPPING badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow">
            <Plane className="h-3.5 w-3.5" />
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

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            {product.category ?? 'Nootropics'}
          </p>
          <h2 className="mt-1.5 font-bold text-surface-900 text-lg leading-tight break-words">
            {product.name}
          </h2>
          <p className="mt-2 text-sm text-surface-600 line-clamp-2 leading-snug">
            {truncated || product.seo?.description || 'Premium nootropic.'}
          </p>
          {/* Dosage / manufacturer-style tags */}
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
          {/* Select Quantity */}
          {product.variants.length > 1 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-surface-600 mb-2">Select quantity</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.slice(0, 6).map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedIndex(i);
                    }}
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
          {/* Price + Add to Cart */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xl font-bold text-surface-900">${price.toFixed(2)} USD</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 transition-colors">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
