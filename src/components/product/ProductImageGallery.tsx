'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  /** Optional: first image is already shown as hero elsewhere; we show all here */
  className?: string;
}

export function ProductImageGallery({ images, productName, className = '' }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  if (!images?.length) return null;

  const current = images[selectedIndex] ?? images[0];
  const isExternal = current.startsWith('http');

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="relative aspect-square w-full min-h-[18rem] sm:min-h-[24rem] rounded-xl overflow-hidden border border-surface-200 bg-surface-50">
        <Image
          src={current}
          alt={`${productName} — image ${selectedIndex + 1} of ${images.length}`}
          fill
          className="object-contain"
          unoptimized={isExternal}
          sizes="(max-width: 1024px) 100vw, 480px"
        />
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                i === selectedIndex
                  ? 'border-brand-500 ring-2 ring-brand-500/30'
                  : 'border-surface-200 hover:border-surface-300'
              }`}
              aria-label={`View image ${i + 1} of ${images.length}`}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                unoptimized={url.startsWith('http')}
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
