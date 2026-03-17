import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { getProductsByCategory } from "@/lib/products"
import { ProductCard } from "@/components/products/product-card"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

const categoryInfo = {
  modafinil: {
    title: "Modafinil Products",
    description: "Generic Modafinil products for enhanced focus and cognitive performance. Modafinil is a wakefulness-promoting agent that provides 12-15 hours of enhanced mental clarity, improved memory retention, and increased productivity.",
    metaDescription: "Buy premium Modafinil online. Modalert, Modvigil, Modaheal and more. Lab-tested quality with worldwide shipping.",
  },
  armodafinil: {
    title: "Armodafinil Products",
    description: "Armodafinil is the R-enantiomer of Modafinil, providing a cleaner, more focused effect with a longer duration. It's preferred by users who want sustained focus without the peak and trough effects of regular Modafinil.",
    metaDescription: "Buy premium Armodafinil online. Waklert, Artvigil, ArmodaXL and more. Lab-tested quality with worldwide shipping.",
  },
}

export async function generateStaticParams() {
  return [
    { category: 'modafinil' },
    { category: 'armodafinil' },
  ]
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const info = categoryInfo[category as keyof typeof categoryInfo]
  
  if (!info) {
    return { title: "Category Not Found | Noofox" }
  }

  return {
    title: `${info.title} | Noofox`,
    description: info.metaDescription,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  const validCategory = category as 'modafinil' | 'armodafinil'
  
  if (!['modafinil', 'armodafinil'].includes(category)) {
    notFound()
  }

  const products = getProductsByCategory(validCategory)
  const info = categoryInfo[validCategory]

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary">{products.length} Products</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {info.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {info.description}
          </p>
        </div>

        {/* Products Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Category Info */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold">
            About {validCategory === 'modafinil' ? 'Modafinil' : 'Armodafinil'}
          </h2>
          <div className="mt-4 grid gap-6 text-sm text-muted-foreground md:grid-cols-2">
            {validCategory === 'modafinil' ? (
              <>
                <div>
                  <h3 className="font-medium text-foreground">What is Modafinil?</h3>
                  <p className="mt-2">
                    Modafinil is a eugeroic (wakefulness-promoting agent) that was
                    originally developed to treat narcolepsy and other sleep
                    disorders. It&apos;s now widely used off-label for cognitive
                    enhancement due to its ability to improve focus, memory, and
                    mental clarity.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Benefits</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>Enhanced focus and concentration</li>
                    <li>Improved memory retention</li>
                    <li>Increased motivation and productivity</li>
                    <li>12-15 hours of wakefulness</li>
                    <li>Reduced fatigue</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-medium text-foreground">What is Armodafinil?</h3>
                  <p className="mt-2">
                    Armodafinil is the R-enantiomer of Modafinil, meaning it
                    contains only the &quot;right-handed&quot; version of the molecule.
                    This results in a longer half-life and more consistent effects
                    throughout the day.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Benefits vs Modafinil</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>Longer lasting effects</li>
                    <li>Smoother onset and offset</li>
                    <li>Lower effective dose (150mg vs 200mg)</li>
                    <li>Less likely to cause jitters</li>
                    <li>Better for sustained focus tasks</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
