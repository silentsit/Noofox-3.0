'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/types/database';
import { useCart } from '@/context/CartContext';
import { getProductImageUrl } from '@/lib/productImage';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const imageUrl = getProductImageUrl(product.images, 0);
  const price = Number(product.price);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      product_id: product.id,
      name: product.name,
      price,
      quantity: qty,
      image_url: imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-surface-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized={imageUrl.startsWith('http')}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/product/${product.id}`}>
          <h2 className="font-semibold text-surface-900 line-clamp-2 hover:text-brand-600 transition-colors">
            {product.name}
          </h2>
        </Link>
        {product.description && (
          <p className="mt-1.5 text-sm text-surface-500 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl font-bold text-brand-600">
            ${price.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-50">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-2.5 py-1 text-surface-500 hover:text-surface-900 transition-colors text-sm font-medium"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-sm font-medium text-surface-900">{qty}</span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="px-2.5 py-1 text-surface-500 hover:text-surface-900 transition-colors text-sm font-medium"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
