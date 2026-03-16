'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { CatalogProduct } from '@/types/catalog';

interface ProductPurchasePanelProps {
  product: CatalogProduct;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo(
    () => product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0],
    [product.variants, selectedVariantId]
  );

  function handleAddToCart() {
    if (!selectedVariant) return;

    addItem({
      product_id: `${product.slug}::${selectedVariant.id}`,
      name: `${product.name} - ${selectedVariant.label}`,
      price: selectedVariant.price,
      quantity,
      image_url: '',
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  if (!selectedVariant) {
    return null;
  }

  return (
    <aside className="rounded-2xl sm:rounded-[2rem] border border-white/10 bg-[#0d1526]/95 p-4 sm:p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] min-w-0 w-full">
      <p className="text-xs uppercase tracking-[0.24em] text-brand-200">Package selection</p>
      <div className="mt-4 space-y-3">
        {product.variants.map((variant) => {
          const isSelected = variant.id === selectedVariant.id;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`w-full min-h-[52px] rounded-xl sm:rounded-[1.35rem] border px-4 py-4 text-left transition-colors touch-manipulation ${
                isSelected
                  ? 'border-brand-300 bg-brand-400/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{variant.quantityText}</p>
                  <p className="mt-1 text-sm text-surface-300">{variant.perUnitText ?? 'Flexible package'}</p>
                </div>
                <div className="text-right">
                  {variant.regularPrice && (
                    <p className="text-sm text-surface-500 line-through">
                      ${variant.regularPrice.toFixed(2)}
                    </p>
                  )}
                  <p className="text-lg font-semibold text-white">${variant.price.toFixed(2)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-surface-400">Selected package</p>
            <p className="mt-2 text-xl font-semibold text-white">{selectedVariant.quantityText}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.22em] text-surface-400">Today</p>
            <p className="mt-2 text-2xl font-semibold text-white">${selectedVariant.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <label htmlFor="product-quantity" className="text-sm text-surface-300 shrink-0">
            Qty
          </label>
          <div className="flex items-center rounded-full border border-white/10 bg-surface-950 px-1">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-lg text-white transition-colors hover:text-brand-200 touch-manipulation"
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
              className="w-12 min-h-[44px] border-0 bg-transparent text-center text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-lg text-white transition-colors hover:text-brand-200 touch-manipulation"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`mt-5 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full px-5 py-3.5 font-medium transition-colors touch-manipulation ${
            added
              ? 'bg-emerald-500 text-surface-950'
              : 'bg-brand-300 text-surface-950 hover:bg-brand-200'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          {added ? 'Added to cart' : 'Add package to cart'}
        </button>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-surface-300">
        <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-brand-200" />
          <div>
            <p className="font-medium text-white">Transparent pricing</p>
            <p className="mt-1 leading-6">Same live-site package pricing and structure, preserved exactly.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
          <Truck className="mt-0.5 h-4 w-4 text-brand-200" />
          <div>
            <p className="font-medium text-white">Discreet delivery</p>
            <p className="mt-1 leading-6">Free express shipping over $300 with discreet packaging guidance.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
