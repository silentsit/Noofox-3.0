import { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { getCatalogProducts } from '@/lib/catalog'
import { ProductCard } from '@/components/products/ProductCard'

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete selection of premium Modafinil and Armodafinil products. Free worldwide shipping on all orders.',
}

export default async function ShopPage() {
  const products = await getCatalogProducts()
  const modafinilProducts = products.filter(p => p.category?.toLowerCase().includes('modafinil') && !p.category?.toLowerCase().includes('armodafinil'))
  const armodafinilProducts = products.filter(p => p.category?.toLowerCase().includes('armodafinil'))
  const otherProducts = products.filter(p => !modafinilProducts.includes(p) && !armodafinilProducts.includes(p))

  return (
    <div className="py-12">
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
        </div>

        {/* Modafinil Section */}
        {modafinilProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Modafinil</h2>
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
          </div>
        )}

        {/* Armodafinil Section */}
        {armodafinilProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Armodafinil</h2>
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
          </div>
        )}

        {/* Other Products */}
        {otherProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Other Products</h2>
              <Badge variant="outline">{otherProducts.length} products</Badge>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        )}

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
