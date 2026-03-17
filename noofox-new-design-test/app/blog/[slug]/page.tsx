import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { blogPosts, getBlogPostBySlug } from "@/lib/blog"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  
  if (!post) {
    return { title: "Post Not Found | Noofox" }
  }

  return {
    title: `${post.title} | Noofox Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  
  if (!post) {
    notFound()
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 2)

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        {/* Header */}
        <div className="mt-8">
          <Badge>{post.category}</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {post.excerpt}
          </p>
          
          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted sm:h-10 sm:w-10" />
              <div>
                <p className="font-medium text-foreground">{post.author}</p>
              </div>
            </div>
            <span className="hidden text-border sm:inline">|</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="sm:hidden">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <div className="relative aspect-video">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-invert mt-12 max-w-none">
          <div 
            className="text-muted-foreground [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mt-4 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-inside [&_ul]:list-disc [&_ul]:space-y-2 [&_li]:text-muted-foreground [&_strong]:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        </article>

        {/* Share */}
        <div className="mt-12 flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <span className="text-sm text-muted-foreground">Share this article</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Author Box */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-muted" />
            <div>
              <p className="font-semibold">{post.author}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Medical writer and researcher specializing in cognitive enhancement
                and nootropics. With over 10 years of experience in pharmacology.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold">Related Articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="text-xs">
                      {relatedPost.category}
                    </Badge>
                    <h3 className="mt-2 font-semibold transition-colors group-hover:text-primary">
                      {relatedPost.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {relatedPost.readTime}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-primary p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground">
            Ready to Try Modafinil?
          </h2>
          <p className="mt-2 text-primary-foreground/80">
            Shop our selection of premium cognitive enhancers
          </p>
          <Button variant="secondary" size="lg" className="mt-6" asChild>
            <Link href="/shop">Shop Now</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
