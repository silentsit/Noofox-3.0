import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
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
  const imageUrl = p.images?.[0];
  const price = Number(p.price);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm font-medium text-primary-600 hover:text-primary-700">
        ← Back to home
      </Link>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-100">
          {imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/')) ? (
            <Image
              src={imageUrl}
              alt={p.name}
              fill
              className="object-cover"
              priority
              unoptimized={imageUrl.startsWith('http')}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-surface-400">
              No image
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-surface-900 sm:text-3xl">
            {p.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold text-primary-600">
            ${price.toFixed(2)}
          </p>
          {p.description && (
            <p className="mt-6 text-surface-600">{p.description}</p>
          )}
          <div className="mt-8">
            <ProductCard product={p} />
          </div>
        </div>
      </div>
    </div>
  );
}
