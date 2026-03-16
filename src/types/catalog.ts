export interface CatalogBreadcrumb {
  name: string;
  href: string;
}

export interface CatalogVariant {
  id: string;
  sku: string | null;
  label: string;
  quantityText: string;
  perUnitText: string | null;
  price: number;
  regularPrice: number | null;
  inStock: boolean;
  priceHtml: string;
  attributes: Record<string, string>;
}

export interface CatalogReviewSummary {
  averageRating: number | null;
  reviewCount: number;
}

export interface CatalogFaq {
  question: string;
  answer: string;
}

export interface CatalogSeo {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  openGraph: {
    type: string;
    title: string;
    description: string;
    url: string;
    siteName: string;
    updatedTime: string;
    imageAlt: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    creator: string;
    label1: string;
    data1: string;
    label2: string;
    data2: string;
  };
}

export interface CatalogProduct {
  id: string;
  slug: string;
  urlPath: string;
  sourceUrl: string;
  name: string;
  title: string;
  priceText: string;
  priceRange: {
    min: number;
    max: number;
  };
  category: string | null;
  /** Optional image URLs (Supabase Storage or external); first used as hero/thumbnail */
  images?: string[];
  breadcrumbs: CatalogBreadcrumb[];
  shortDescriptionHtml: string;
  shortDescriptionText: string;
  descriptionHtml: string;
  descriptionText: string;
  variants: CatalogVariant[];
  reviewSummary: CatalogReviewSummary;
  relatedSlugs: string[];
  faqs: CatalogFaq[];
  seo: CatalogSeo;
  structuredData: unknown[];
}

export interface CatalogDataset {
  generatedAt: string;
  source: string;
  sitemapUrl: string;
  productCount: number;
  products: CatalogProduct[];
}
