import { createClient } from '@/lib/supabase/server';
import type {
  CatalogProduct,
  CatalogVariant,
  CatalogFaq,
  CatalogDataset,
  CatalogBreadcrumb,
  CatalogReviewSummary,
  CatalogSeo,
} from '@/types/catalog';

/** Fallback when Supabase catalog is empty or unavailable */
async function getCatalogFromJson(): Promise<CatalogProduct[]> {
  try {
    const catalogData = await import('@/data/catalog.json');
    const catalog = catalogData.default as CatalogDataset;
    return catalog.products ?? [];
  } catch {
    return [];
  }
}

function mapRowToProduct(
  row: {
    id: string;
    slug: string;
    url_path: string;
    source_url: string | null;
    name: string;
    title: string;
    price_text: string;
    price_min: number;
    price_max: number;
    category: string | null;
    breadcrumbs: CatalogBreadcrumb[] | unknown;
    short_description_html: string;
    short_description_text: string;
    description_html: string;
    description_text: string;
    review_average_rating: number | null;
    review_count: number;
    related_slugs: string[];
    seo: CatalogSeo | unknown;
    structured_data: unknown[];
    images?: string[];
  },
  variants: CatalogVariant[],
  faqs: CatalogFaq[]
): CatalogProduct {
  return {
    id: row.slug,
    slug: row.slug,
    urlPath: row.url_path,
    sourceUrl: row.source_url ?? '',
    name: row.name,
    title: row.title,
    priceText: row.price_text,
    priceRange: { min: Number(row.price_min), max: Number(row.price_max) },
    category: row.category ?? null,
    images: row.images?.length ? row.images : undefined,
    breadcrumbs: Array.isArray(row.breadcrumbs) ? row.breadcrumbs : [],
    shortDescriptionHtml: row.short_description_html ?? '',
    shortDescriptionText: row.short_description_text ?? '',
    descriptionHtml: row.description_html ?? '',
    descriptionText: row.description_text ?? '',
    variants,
    reviewSummary: {
      averageRating: row.review_average_rating != null ? Number(row.review_average_rating) : null,
      reviewCount: Number(row.review_count) || 0,
    },
    relatedSlugs: row.related_slugs ?? [],
    faqs,
    seo: (row.seo as CatalogSeo) ?? ({} as CatalogSeo),
    structuredData: Array.isArray(row.structured_data) ? row.structured_data : [],
  };
}

function mapVariantRow(v: {
  id: string;
  variant_id: string;
  sku: string | null;
  label: string;
  quantity_text: string;
  per_unit_text: string | null;
  price: number;
  regular_price: number | null;
  in_stock: boolean;
  price_html: string;
  attributes: Record<string, string> | unknown;
}): CatalogVariant {
  return {
    id: v.variant_id,
    sku: v.sku ?? null,
    label: v.label,
    quantityText: v.quantity_text,
    perUnitText: v.per_unit_text ?? null,
    price: Number(v.price),
    regularPrice: v.regular_price != null ? Number(v.regular_price) : null,
    inStock: v.in_stock ?? true,
    priceHtml: v.price_html ?? '',
    attributes: (v.attributes as Record<string, string>) ?? {},
  };
}

function mapFaqRow(f: { question: string; answer: string }): CatalogFaq {
  return { question: f.question, answer: f.answer };
}

/** Fetch all catalog products from Supabase; fall back to JSON if empty or error */
export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from('catalog_products')
      .select('*')
      .order('slug');

    if (error || !rows?.length) return getCatalogFromJson();

    const productIds = rows.map((r) => r.id);
    const [variantsRes, faqsRes] = await Promise.all([
      supabase.from('catalog_variants').select('*').in('product_id', productIds),
      supabase.from('catalog_faqs').select('*').in('product_id', productIds).order('sort_order', { ascending: true }),
    ]);

    const variantsByProduct = new Map<string, CatalogVariant[]>();
    for (const v of variantsRes.data ?? []) {
      const list = variantsByProduct.get(v.product_id) ?? [];
      list.push(mapVariantRow(v));
      variantsByProduct.set(v.product_id, list);
    }
    const faqsByProduct = new Map<string, CatalogFaq[]>();
    for (const f of faqsRes.data ?? []) {
      const list = faqsByProduct.get(f.product_id) ?? [];
      list.push(mapFaqRow(f));
      faqsByProduct.set(f.product_id, list);
    }

    return rows.map((row) =>
      mapRowToProduct(
        row,
        variantsByProduct.get(row.id) ?? [],
        (faqsByProduct.get(row.id) ?? []).sort((a, b) => 0)
      )
    );
  } catch {
    return getCatalogFromJson();
  }
}

export async function getCatalogDataset(): Promise<CatalogDataset> {
  const products = await getCatalogProducts();
  return {
    generatedAt: new Date().toISOString(),
    source: 'https://noofox.com',
    sitemapUrl: 'https://noofox.com/product-sitemap.xml',
    productCount: products.length,
    products,
  };
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogProduct | undefined> {
  const products = await getCatalogProducts();
  return products.find((p) => p.slug === slug);
}

export async function getFeaturedCatalogProducts(limit: number = 8): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts();
  return products.slice(0, limit);
}

export async function getRelatedCatalogProducts(
  product: CatalogProduct,
  limit: number = 4
): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts();
  const bySlug = new Map(products.map((entry) => [entry.slug, entry]));
  const related = product.relatedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is CatalogProduct => Boolean(entry))
    .slice(0, limit);
  if (related.length >= limit) return related;
  const fallback = products.filter(
    (entry) => entry.slug !== product.slug && !related.some((item) => item.slug === entry.slug)
  );
  return [...related, ...fallback.slice(0, Math.max(limit - related.length, 0))];
}
