import Link from 'next/link';
import Image from 'next/image';
import type { CatalogProduct } from '@/types/catalog';
import { getCatalogProductImageUrl } from '@/lib/productImage';
import { ImageIcon } from 'lucide-react';

interface HomeFeaturedCardProps {
  product: CatalogProduct;
}

export function HomeFeaturedCard({ product }: HomeFeaturedCardProps) {
  const imageUrl = getCatalogProductImageUrl(product, 0);
  const priceLabel =
    product.priceRange.min === product.priceRange.max
      ? `$${product.priceRange.min.toFixed(2)}`
      : `From $${product.priceRange.min.toFixed(2)}`;
  const shortDesc = product.shortDescriptionText?.replace(/<[^>]*>/g, '').slice(0, 120) ?? product.seo?.description ?? '';
  const truncated = shortDesc.length >= 120 ? `${shortDesc.slice(0, 117)}...` : shortDesc;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm transition-shadow hover:shadow-md min-w-0">
      <Link href={product.urlPath} className="flex flex-col h-full min-h-[44px]">
        {/* Top ~2/3: image area */}
        <div className="relative aspect-[4/3] w-full bg-surface-100 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform group-hover:scale-[1.02]"
              unoptimized={imageUrl.startsWith('http')}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-surface-300">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg border-2 border-dashed border-surface-300 p-4">
                  <ImageIcon className="h-10 w-10 text-surface-400" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-surface-500">Product image</span>
              </div>
            </div>
          )}
        </div>
        {/* Bottom ~1/3: details */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h2 className="font-semibold text-surface-900 text-lg leading-tight break-words">
            {product.name}
          </h2>
          <p className="mt-2 text-sm text-surface-500 line-clamp-2 leading-snug">
            {truncated || product.seo?.description || 'Premium nootropic.'}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xl font-bold text-surface-900">{priceLabel}</span>
            <span className="shrink-0 rounded-lg bg-surface-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-surface-800 transition-colors">
              Buy Now
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
