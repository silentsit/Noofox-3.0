import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import { FAQAccordion } from '@/components/home/FAQAccordion';
import { Package, CreditCard, Truck, Sparkles, Bitcoin, Shield, Clock, Headphones } from 'lucide-react';

export const dynamic = 'force-dynamic';

const howItWorksSteps = [
  {
    icon: Package,
    title: 'Choose Products',
    description: 'Browse our selection of premium nootropics and add your favorites to the cart.',
  },
  {
    icon: CreditCard,
    title: 'Pay with Crypto',
    description: 'Pay securely with Bitcoin, Ethereum, or USDT. No crypto? Use our USD on-ramp.',
  },
  {
    icon: Truck,
    title: 'Discreet Shipping',
    description: 'Your order is shipped discreetly with tracking. Free shipping worldwide.',
  },
  {
    icon: Sparkles,
    title: 'Enjoy Results',
    description: 'Experience enhanced focus, energy, and cognitive performance.',
  },
];

const cryptoCoins = [
  { name: 'Bitcoin', ticker: 'BTC' },
  { name: 'Ethereum', ticker: 'ETH' },
  { name: 'Tether', ticker: 'USDT' },
  { name: 'USD Coin', ticker: 'USDC' },
];

const trustBadges = [
  { icon: Truck, title: 'Free Shipping', subtitle: 'On all orders' },
  { icon: Shield, title: 'Secure Payments', subtitle: 'Crypto & USD Ramp' },
  { icon: CreditCard, title: 'Best Prices', subtitle: 'Guaranteed' },
  { icon: Headphones, title: '24/7 Support', subtitle: 'Always here' },
];

export default async function HomePage() {
  let featured: import('@/types/database').Product[] = [];
  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    featured = products ?? [];
  } catch (_e) {
    // Supabase unavailable: show page with placeholders
  }

  return (
    <>
      {/* Hero — dark */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-surface-950 via-surface-900 to-surface-950 px-4 py-24 sm:py-32 lg:py-40"
        aria-label="Hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            Unlock Your Mind&apos;s Full Potential
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-400">
            Premium nootropics delivered worldwide. Pay with crypto or use our USD on-ramp.
            Free shipping on every order.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#featured"
              className="rounded-xl bg-brand-600 px-8 py-3.5 font-semibold text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25"
            >
              Shop Now
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-xl border border-surface-600 px-8 py-3.5 font-semibold text-surface-300 hover:border-surface-400 hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Our Products — white bg */}
      <section
        id="featured"
        className="bg-white px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="featured-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 id="featured-heading" className="text-3xl font-bold text-surface-900 sm:text-4xl">
              Our Products
            </h2>
            <p className="mt-3 text-surface-500 max-w-2xl mx-auto">
              Pharmaceutical-grade cognitive enhancers, shipped discreetly worldwide with free shipping.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.length > 0 ? (
              featured.map((product) => (
                <ProductCard key={product.id} product={product as import('@/types/database').Product} />
              ))
            ) : (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white p-5 animate-pulse"
                  >
                    <div className="aspect-[4/3] w-full rounded-xl bg-surface-100" />
                    <div className="mt-4 h-5 w-3/4 rounded bg-surface-100" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-surface-100" />
                    <div className="mt-4 flex-1" />
                    <div className="mt-4 h-10 rounded-lg bg-surface-100" />
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex rounded-xl bg-brand-600 px-8 py-3.5 font-semibold text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* How it works — light gray bg */}
      <section
        id="how-it-works"
        className="bg-surface-50 px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="how-heading"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 id="how-heading" className="text-3xl font-bold text-surface-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-surface-500 max-w-2xl mx-auto">
              Get started in minutes with our streamlined ordering process.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorksSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="rounded-2xl border border-surface-200 bg-white p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                    <Icon className="h-7 w-7 text-brand-600" />
                  </div>
                  <h3 className="mt-6 font-semibold text-surface-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-surface-500 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pay with Crypto — white bg */}
      <section
        id="payment"
        className="bg-white px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="payment-heading"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 id="payment-heading" className="text-3xl font-bold text-surface-900 sm:text-4xl">
              Pay with Crypto
            </h2>
            <p className="mt-3 text-surface-500 max-w-2xl mx-auto">
              We accept all major cryptocurrencies for secure, private transactions.
              Don&apos;t have crypto? No problem—use our USD on-ramp to purchase cryptocurrency
              instantly and complete your order.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {cryptoCoins.map(({ name, ticker }) => (
              <div key={ticker} className="rounded-2xl border border-surface-200 bg-surface-50 p-6 text-center hover:border-brand-300 hover:shadow-sm transition-all">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                  <Bitcoin className="h-6 w-6 text-brand-600" />
                </div>
                <p className="mt-3 font-semibold text-surface-900">{name}</p>
                <p className="text-sm text-surface-500">{ticker}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-surface-200 bg-surface-50 p-8 sm:p-10">
            <h3 className="text-xl font-bold text-surface-900">USD On-Ramp</h3>
            <p className="mt-1 text-sm font-medium text-brand-600">Buy crypto instantly</p>
            <p className="mt-4 text-surface-600 leading-relaxed">
              Don&apos;t own cryptocurrency? Use our integrated USD on-ramp to purchase crypto
              with your credit card, debit card, or bank transfer. Complete your purchase in minutes.
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-500 transition-colors"
            >
              Learn About USD Ramp
            </button>
          </div>
        </div>
      </section>

      {/* FAQ — light gray bg */}
      <section
        id="faq"
        className="bg-surface-50 px-4 py-20 sm:px-6 lg:px-8"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 id="faq-heading" className="text-3xl font-bold text-surface-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-surface-500">
              Find answers to common questions about our products and services.
            </p>
          </div>
          <div className="mt-12">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* Trust badges — white bg with top border */}
      <section className="bg-white border-t border-surface-200 px-4 py-12 sm:px-6 lg:px-8" aria-label="Trust badges">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {trustBadges.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto h-6 w-6 text-brand-600" />
                <p className="mt-2 font-semibold text-surface-900 text-sm">{title}</p>
                <p className="text-xs text-surface-500">{subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
