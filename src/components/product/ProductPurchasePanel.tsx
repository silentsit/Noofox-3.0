'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { getCatalogProductImageUrl } from '@/lib/productImage';
import type { CatalogProduct } from '@/types/catalog';

interface ProductPurchasePanelProps {
  product: CatalogProduct;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0],
    [product.variants, selectedVariantId]
  );

  function handleBuyNow() {
    if (!selectedVariant) return;
    setSubmitting(true);
    const img = getCatalogProductImageUrl(product, 0);
    addItem({
      product_id: `${product.slug}::${selectedVariant.id}`,
      name: `${product.name} - ${selectedVariant.label}`,
      price: selectedVariant.price,
      quantity,
      image_url: img ?? '',
    });
    router.push('/checkout');
  }

  if (!selectedVariant) {
    return null;
  }

  return (
    <div>
      <label className="text-sm font-medium">Select Package</label>
      <div className="mt-3 space-y-3">
        {product.variants.map((variant) => {
          const isSelected = variant.id === selectedVariant.id;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={cn(
                'w-full rounded-xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{variant.quantityText}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{variant.perUnitText ?? 'Flexible package'}</p>
                </div>
                <div className="text-right">
                  {variant.regularPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      ${variant.regularPrice.toFixed(2)}
                    </p>
                  )}
                  <p className="text-lg font-semibold">${variant.price.toFixed(2)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Price Summary */}
      <div className="mt-6 rounded-xl bg-muted p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Selected:</span>
          <span className="font-medium">{selectedVariant.quantityText}</span>
        </div>
        {selectedVariant.perUnitText && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Per unit:</span>
            <span className="font-medium">{selectedVariant.perUnitText}</span>
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <label htmlFor="product-quantity" className="text-sm text-muted-foreground shrink-0">
            Qty
          </label>
          <div className="flex items-center rounded-lg border border-border bg-background">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="h-9 w-9 flex items-center justify-center text-lg transition-colors hover:text-primary"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              id="product-quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
              className="w-12 h-9 border-0 bg-transparent text-center focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              className="h-9 w-9 flex items-center justify-center text-lg transition-colors hover:text-primary"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            ${(selectedVariant.price * quantity).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={submitting}
        className={cn(
          'mt-6 flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 font-medium transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70'
        )}
      >
        <Zap className="h-4 w-4" aria-hidden />
        {submitting ? 'Redirecting…' : 'Buy now'}
      </button>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        You&apos;ll complete payment on the next step — crypto or card via Guardarian.
      </p>
    </div>
  );
}
