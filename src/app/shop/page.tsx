import Link from 'next/link'
import { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShopCategoryTabs } from '@/components/shop/ShopCategoryTabs'
import { getCatalogProducts } from '@/lib/catalog'
import { getProductsBySilo } from '@/lib/catalogCategories'
import { ProductCard } from '@/components/products/ProductCard'
import { itemListJsonLd } from '@/lib/schema'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noofox.com'

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete selection of premium Modafinil and Armodafinil products. Free worldwide shipping on all orders.',
  alternates: { canonical: `${BASE}/shop` },
}

export default async function ShopPage() {
  const products = await getCatalogProducts()
  const modafinilProducts = getProductsBySilo(products, 'modafinil')
  const armodafinilProducts = getProductsBySilo(products, 'armodafinil')
  const comboProducts = getProductsBySilo(products, 'combo')
  const listLd = itemListJsonLd(
    'Noofox Shop',
    'Modafinil, Armodafinil, and combo products.',
    '/shop',
    products
  )

  return (
    <div className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary">All Products</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Shop Cognitive Enhancers
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Browse our complete selection of premium Modafinil and Armodafinil
            products. All products are lab-tested and shipped worldwide with
            discreet packaging.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/modafinil">Modafinil</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/armodafinil">Armodafinil</Link>
            </Button>
          </div>
        </div>

        <div id="all" className="scroll-mt-32">
          <ShopCategoryTabs />

        {/* Modafinil Section */}
        {modafinilProducts.length > 0 && (
          <section id="modafinil" className="mt-12 scroll-mt-32" aria-labelledby="modafinil-heading">
            <div className="flex items-center gap-4">
              <h2 id="modafinil-heading" className="text-2xl font-bold">Modafinil</h2>
              <Badge variant="outline">{modafinilProducts.length} products</Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              Generic Modafinil products for enhanced focus and cognitive
              performance. Duration: 12-15 hours.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {modafinilProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Armodafinil Section */}
        {armodafinilProducts.length > 0 && (
          <section id="armodafinil" className="mt-20 scroll-mt-32" aria-labelledby="armodafinil-heading">
            <div className="flex items-center gap-4">
              <h2 id="armodafinil-heading" className="text-2xl font-bold">Armodafinil</h2>
              <Badge variant="outline">{armodafinilProducts.length} products</Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              R-enantiomer of Modafinil for cleaner, longer-lasting effects.
              Preferred for sustained focus without peaks and troughs.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {armodafinilProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Combos */}
        {comboProducts.length > 0 && (
          <section id="combos" className="mt-20 scroll-mt-32" aria-labelledby="combos-heading">
            <div className="flex items-center gap-4">
              <h2 id="combos-heading" className="text-2xl font-bold">Nootropic Combos</h2>
              <Badge variant="outline">{comboProducts.length} products</Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              Curated bundles for trying multiple options in one order.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {comboProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        )}
        </div>

        {/* Info Banner */}
        <div className="mt-20 rounded-2xl border border-border bg-card p-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-semibold">Free Worldwide Shipping</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                All orders ship free with tracking. Express options available.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Secure Crypto Payments</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Pay with BTC, ETH, USDT, or USDC. Card payments converted to
                crypto via Guardarian.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">100% Authentic Products</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                All products are sourced directly from licensed manufacturers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
