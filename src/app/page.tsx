import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  const featured = products ?? [];

  return (
    <>
      <section
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 px-4 py-24 text-white sm:px-6 lg:px-8"
        aria-label="Hero"
      >
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to Noofox
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
            Modern shopping with instant checkout. Pay with card or crypto—no KYC
            required for purchases under $700.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#featured"
              className="rounded-lg bg-white px-6 py-3 font-medium text-primary-700 hover:bg-primary-50"
            >
              Shop Bestsellers
            </Link>
            <Link
              href="/checkout"
              className="rounded-lg border-2 border-white px-6 py-3 font-medium hover:bg-white/10"
            >
              Go to Checkout
            </Link>
          </div>
        </div>
      </section>

      <section
        id="featured"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        aria-labelledby="featured-heading"
      >
        <h2 id="featured-heading" className="text-2xl font-semibold text-surface-900 sm:text-3xl">
          Featured Bestsellers
        </h2>
        <p className="mt-2 text-surface-600">
          Our most popular products. Buy now for instant checkout.
        </p>
        <div
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gridTemplateRows: 'auto auto' }}
        >
          {featured.length > 0 ? (
            featured.map((product) => (
              <ProductCard key={product.id} product={product as import('@/types/database').Product} />
            ))
          ) : (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-xl border border-surface-200 bg-surface-50 p-4"
                >
                  <div className="aspect-square w-full rounded-lg bg-surface-200" />
                  <div className="mt-4 h-5 w-3/4 rounded bg-surface-200" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-surface-200" />
                  <div className="mt-4 flex-1" />
                  <div className="mt-4 h-10 rounded-lg bg-surface-200" />
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </>
  );
}
