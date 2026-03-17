import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/products"

interface ProductCardProps {
  product: Product
}

// Map product IDs to whalefriend images
const productImages: Record<string, string> = {
  'modalert-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/47ed6a6e-27f4-4d1b-af9a-0dc61d7d2de9.png',
  'modvigil-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/ca2fb5b9-5af5-47c3-8a18-f6b9bbb3ad97.png',
  'modaheal-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/bcfe1e2b-ce80-4d12-84d7-4f14e9f61f9b.png',
  'modawake-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/e18e391a-2e45-4eea-946e-1bc56f6dbc1e.png',
  'vilafinil-200': 'https://whalefriend-shop.lovable.app/lovable-uploads/bcfe1e2b-ce80-4d12-84d7-4f14e9f61f9b.png',
  'modaxl-300': 'https://whalefriend-shop.lovable.app/lovable-uploads/47ed6a6e-27f4-4d1b-af9a-0dc61d7d2de9.png',
  'waklert-150': 'https://whalefriend-shop.lovable.app/lovable-uploads/ca2fb5b9-5af5-47c3-8a18-f6b9bbb3ad97.png',
  'artvigil-150': 'https://whalefriend-shop.lovable.app/lovable-uploads/e18e391a-2e45-4eea-946e-1bc56f6dbc1e.png',
  'armodaxl-150': 'https://whalefriend-shop.lovable.app/lovable-uploads/bcfe1e2b-ce80-4d12-84d7-4f14e9f61f9b.png',
  'armodaxl-250': 'https://whalefriend-shop.lovable.app/lovable-uploads/47ed6a6e-27f4-4d1b-af9a-0dc61d7d2de9.png',
}

export function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = product.variants[0].price
  const imageUrl = productImages[product.id] || productImages['modalert-200']

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.featured && (
            <Badge className="absolute left-3 top-3">Best Seller</Badge>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {product.category === 'modafinil' ? 'Modafinil' : 'Armodafinil'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {product.dosage}
          </Badge>
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-2 font-semibold transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.shortDescription}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              From ${lowestPrice}
            </p>
            <p className="text-xs text-muted-foreground">
              ${product.variants[0].pricePerPill.toFixed(2)}/pill
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href={`/product/${product.slug}`}>
              Buy Now
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
