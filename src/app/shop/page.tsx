import { ProductCard } from '@/components/product/ProductCard';
import { getCatalogProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop Noofox Products',
  description: 'Browse every live Noofox product with matching URLs, package options, pricing, and SEO metadata.',
};

export default async function ShopPage() {
  const products = await getCatalogProducts();

  return (
    <div className="min-h-screen min-w-0 bg-[#f6f0e7] text-surface-900">
      <section className="relative overflow-hidden bg-[#07111f] px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.14),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-200">Imported live catalog</p>
          <div className="mt-6 grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
            <div className="min-w-0">
              <h1 className="font-display text-3xl leading-tight text-white xs:text-4xl sm:text-5xl lg:text-6xl break-words">
                Browse every live Noofox product in a cleaner, more trustworthy storefront.
              </h1>
              <p className="mt-4 sm:mt-6 max-w-3xl text-base sm:text-lg leading-7 sm:leading-8 text-surface-300">
                Same product URLs, same package structure, same long-form content, and the same pricing as the
                live site, re-presented with stronger hierarchy, calmer decision-making, and more visible trust signals.
              </p>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl sm:rounded-[1.75rem] border border-white/10 bg-white/5 p-4 sm:p-5 min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-surface-400">Products</p>
                <p className="mt-2 sm:mt-3 font-display text-3xl sm:text-4xl text-white">{products.length}</p>
              </div>
              <div className="rounded-xl sm:rounded-[1.75rem] border border-white/10 bg-white/5 p-4 sm:p-5 min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-surface-400">Lowest starting price</p>
                <p className="mt-2 sm:mt-3 font-display text-3xl sm:text-4xl text-white">
                  $
                  {Math.min(...products.map((product) => product.priceRange.min)).toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl sm:rounded-[1.75rem] border border-white/10 bg-white/5 p-4 sm:p-5 min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-surface-400">Trust signal</p>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base leading-7 text-surface-200">
                  Package counts, review totals, and pricing are visible before the click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl min-w-0">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="rounded-xl sm:rounded-[1.6rem] border border-surface-300/70 bg-white p-4 sm:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-surface-500">Transparency</p>
              <p className="mt-3 text-sm leading-7 text-surface-600">
                Each product card shows review counts, package counts, and starting price immediately.
              </p>
            </div>
            <div className="rounded-xl sm:rounded-[1.6rem] border border-surface-300/70 bg-white p-4 sm:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-surface-500">Confidence</p>
              <p className="mt-3 text-sm leading-7 text-surface-600">
                The experience reduces ambiguity by pushing selection and purchase into a dedicated detail page.
              </p>
            </div>
            <div className="rounded-xl sm:rounded-[1.6rem] border border-surface-300/70 bg-white p-4 sm:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-surface-500">SEO continuity</p>
              <p className="mt-3 text-sm leading-7 text-surface-600">
                Live slugs, meta titles, descriptions, FAQs, and structured data are preserved for each product page.
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
