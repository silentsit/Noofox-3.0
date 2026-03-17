"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Product, ProductVariant } from "@/lib/products"
import { cn } from "@/lib/utils"

interface ProductPurchaseFormProps {
  product: Product
}

export function ProductPurchaseForm({ product }: ProductPurchaseFormProps) {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0]
  )

  const handleBuyNow = () => {
    // Navigate to checkout with product and variant info
    const params = new URLSearchParams({
      product: product.id,
      pills: selectedVariant.pills.toString(),
    })
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <div>
      {/* Variant Selection */}
      <div>
        <label className="text-sm font-medium">Select Quantity</label>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {product.variants.map((variant) => (
            <button
              key={variant.pills}
              onClick={() => setSelectedVariant(variant)}
              className={cn(
                "flex flex-col items-center rounded-xl border p-4 transition-all",
                selectedVariant.pills === variant.pills
                  ? "border-primary bg-primary/10 ring-2 ring-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-lg font-semibold">{variant.pills} pills</span>
              <span className="text-2xl font-bold text-primary">
                ${variant.price}
              </span>
              <span className="text-xs text-muted-foreground">
                ${variant.pricePerPill.toFixed(2)}/pill
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="mt-6 rounded-xl bg-muted p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Selected:</span>
          <span className="font-medium">
            {selectedVariant.pills} x {product.name}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Price per pill:</span>
          <span className="font-medium">
            ${selectedVariant.pricePerPill.toFixed(2)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            ${selectedVariant.price}
          </span>
        </div>
      </div>

      {/* Buy Now Button */}
      <Button
        size="lg"
        className="mt-6 w-full"
        onClick={handleBuyNow}
      >
        Buy Now
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Secure checkout with crypto or card payment
      </p>
    </div>
  )
}
