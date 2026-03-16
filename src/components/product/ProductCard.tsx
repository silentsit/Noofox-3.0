import Link from 'next/link';
import Image from 'next/image';
import type { CatalogProduct } from '@/types/catalog';
import { getCatalogProductImageUrl } from '@/lib/productImage';
import { ArrowUpRight, ShieldCheck, Star } from 'lucide-react';

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getCatalogProductImageUrl(product, 0);
  const packageCount = product.variants.length;
  const priceLabel =
    product.priceRange.min === product.priceRange.max
      ? `$${product.priceRange.min.toFixed(2)}`
      : `From $${product.priceRange.min.toFixed(2)}`;
  const reviewLabel = product.reviewSummary.averageRating
    ? `${product.reviewSummary.averageRating.toFixed(1)} / 5`
    : 'Verified product';

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-[2rem] border border-white/10 bg-surface-950/90 shadow-[0_30px_80px_rgba(2,6,23,0.4)] transition-transform duration-300 hover:-translate-y-1 min-w-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.14),transparent_35%)]" />
      <Link href={product.urlPath} className="relative flex h-full flex-col p-4 sm:p-6 min-h-[44px]">
        <div className="flex items-start justify-between gap-3 sm:gap-4 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] text-brand-200">
              {product.category ?? 'Premium nootropic'}
            </p>
            <h2 className="mt-3 sm:mt-4 font-display text-xl sm:text-2xl text-white transition-colors group-hover:text-brand-100 break-words">
              {product.name}
            </h2>
          </div>
          <span className="rounded-full border border-brand-400/20 bg-brand-400/10 p-2 text-brand-200 shrink-0 flex min-h-[44px] min-w-[44px] items-center justify-center">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-4 sm:mt-6 flex min-h-[11rem] sm:min-h-[13rem] items-end rounded-xl sm:rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(17,24,39,0.64))] p-4 sm:p-6 overflow-hidden relative">
          {imageUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                unoptimized={imageUrl.startsWith('http')}
                sizes="(max-width: 640px) 100vw, 320px"
              />
            </div>
          ) : (
            <div className="min-w-0 relative z-10">
              <p className="text-xs uppercase tracking-[0.28em] text-surface-400">No image yet</p>
              <p className="mt-2 sm:mt-3 font-display text-4xl sm:text-5xl leading-none text-white">
                {product.name
                  .split(' ')
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join('')}
              </p>
              <p className="mt-3 sm:mt-4 max-w-full sm:max-w-[16rem] text-xs sm:text-sm leading-6 text-surface-300">
                Same pricing, package structure, and long-form product content as the live catalog.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-surface-300">
            {packageCount} package{packageCount === 1 ? '' : 's'}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-surface-300">
            {product.reviewSummary.reviewCount} reviews
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
            <Star className="h-3.5 w-3.5 fill-current" />
            {reviewLabel}
          </span>
        </div>

        <p className="mt-4 sm:mt-5 line-clamp-3 text-xs sm:text-sm leading-6 text-surface-300 min-w-0">
          {product.shortDescriptionText}
        </p>

        <div className="mt-auto pt-6 sm:pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-surface-400">Pricing</p>
              <p className="mt-2 text-xl sm:text-2xl font-semibold text-white">{priceLabel}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Trusted checkout
            </div>
          </div>
          <div className="mt-4 sm:mt-5 flex min-h-[48px] items-center justify-between rounded-xl sm:rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            <span className="truncate">View packages and details</span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-brand-200 ml-2" />
          </div>
        </div>
      </Link>
    </article>
  );
}
