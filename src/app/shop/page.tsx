import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Products | Noofox',
  description: 'Browse all premium nootropics and cognitive enhancers.',
};

export default async function ShopPage() {
  let products: Product[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    products = (data ?? []) as Product[];
  } catch (_e) {
    // Supabase unavailable
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-surface-900 sm:text-4xl">All Products</h1>
          <p className="mt-3 text-surface-500 max-w-2xl mx-auto">
            Browse our full selection of premium cognitive enhancers.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-surface-500">No products available yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
