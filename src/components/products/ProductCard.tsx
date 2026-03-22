import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CatalogProduct } from '@/types/catalog'
import { getCatalogProductImageUrl } from '@/lib/productImage'

interface ProductCardProps {
  product: CatalogProduct
  /** When set (e.g. on home page), use this URL instead of catalog image. */
  imageUrlOverride?: string | null
}

export function ProductCard({ product, imageUrlOverride }: ProductCardProps) {
  const imageUrl = imageUrlOverride ?? getCatalogProductImageUrl(product)
  const lowestPrice = product.priceRange.min

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <Link href={`/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={imageUrl.startsWith('http')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          {product.reviewSummary.reviewCount > 10 && (
            <Badge className="absolute left-3 top-3">Best Seller</Badge>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.category && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">
              {product.category}
            </Badge>
          </div>
        )}
        <Link href={`/${product.slug}`}>
          <h3 className="mt-2 font-semibold transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        {product.reviewSummary.averageRating != null && product.reviewSummary.reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-0.5 text-primary" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.reviewSummary.averageRating ?? 0)
                      ? 'fill-primary text-primary'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </span>
            <span>
              {product.reviewSummary.averageRating.toFixed(1)} ({product.reviewSummary.reviewCount})
            </span>
          </div>
        )}
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.shortDescriptionText || product.descriptionText?.slice(0, 100)}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              From ${lowestPrice}
            </p>
            {product.variants.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {product.variants.length} options
              </p>
            )}
          </div>
          <Button size="sm" asChild className="w-full sm:w-auto">
            <Link href={`/${product.slug}`}>
              Buy Now
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
