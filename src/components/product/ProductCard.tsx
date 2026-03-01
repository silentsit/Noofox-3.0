'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/database';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const imageUrl = product.images?.[0] ?? '/placeholder-product.jpg';
  const price = Number(product.price);

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      product_id: product.id,
      name: product.name,
      price,
      quantity: 1,
      image_url: imageUrl,
    });
    window.location.href = '/checkout';
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/product/${product.id}`} className="block flex-1">
        <div className="relative aspect-square w-full bg-surface-100">
          {imageUrl.startsWith('http') || imageUrl.startsWith('/') ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              unoptimized={imageUrl.startsWith('http') && !imageUrl.includes('supabase')}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-surface-400">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h2 className="font-semibold text-surface-900 line-clamp-2">
            {product.name}
          </h2>
          {product.description && (
            <p className="mt-1 text-sm text-surface-600 line-clamp-2">
              {product.description}
            </p>
          )}
          <p className="mt-2 text-lg font-semibold text-primary-600">
            ${price.toFixed(2)}
          </p>
        </div>
      </Link>
      <div className="border-t border-surface-100 p-4">
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full rounded-lg bg-primary-600 py-2.5 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Buy Now
        </button>
      </div>
    </article>
  );
}
