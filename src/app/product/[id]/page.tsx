import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { getProductImageUrl } from '@/lib/productImage';
import type { Product } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
  if (!product) notFound();

  const p = product as Product;
  const imageUrl = getProductImageUrl(p.images, 0);
  const price = Number(p.price);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/shop" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
          ← Back to products
        </Link>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-100 border border-surface-200">
            <Image
              src={imageUrl}
              alt={p.name}
              fill
              className="object-cover"
              priority
              unoptimized={imageUrl.startsWith('http')}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 sm:text-3xl">
              {p.name}
            </h1>
            <p className="mt-4 text-3xl font-bold text-brand-600">
              ${price.toFixed(2)}
            </p>
            {p.description && (
              <p className="mt-6 text-surface-600 leading-relaxed">{p.description}</p>
            )}
            <div className="mt-8">
              <ProductCard product={p} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
