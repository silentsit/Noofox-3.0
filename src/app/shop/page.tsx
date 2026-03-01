import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop | Noofox',
  description: 'Browse all products.',
};

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-surface-900">Shop</h1>
      <p className="mt-1 text-surface-600">All products.</p>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(products ?? []).map((product) => (
          <ProductCard key={product.id} product={product as Product} />
        ))}
      </div>
      {(!products || products.length === 0) && (
        <p className="mt-8 text-surface-600">No products yet.</p>
      )}
    </div>
  );
}
