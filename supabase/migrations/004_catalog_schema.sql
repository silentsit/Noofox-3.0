-- Catalog schema: production-ready tables for imported Noofox catalog
-- Replaces reliance on src/data/catalog.json. See doc/CATALOG_BACKEND_SCHEMA.md

-- catalog_products: one row per product (slug, content, SEO, structured data)
CREATE TABLE IF NOT EXISTS public.catalog_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  url_path TEXT NOT NULL,
  source_url TEXT,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  price_text TEXT NOT NULL,
  price_min DECIMAL(12, 2) NOT NULL CHECK (price_min >= 0),
  price_max DECIMAL(12, 2) NOT NULL CHECK (price_max >= 0),
  category TEXT,
  breadcrumbs JSONB NOT NULL DEFAULT '[]',
  short_description_html TEXT NOT NULL DEFAULT '',
  short_description_text TEXT NOT NULL DEFAULT '',
  description_html TEXT NOT NULL DEFAULT '',
  description_text TEXT NOT NULL DEFAULT '',
  review_average_rating DECIMAL(3, 2),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  related_slugs TEXT[] NOT NULL DEFAULT '{}',
  seo JSONB NOT NULL DEFAULT '{}',
  structured_data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_catalog_products_slug ON public.catalog_products(slug);
CREATE INDEX idx_catalog_products_updated_at ON public.catalog_products(updated_at DESC);

COMMENT ON TABLE public.catalog_products IS 'Imported live catalog products; slug is canonical URL key';

-- catalog_variants: one row per package/option per product
CREATE TABLE IF NOT EXISTS public.catalog_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.catalog_products(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  sku TEXT,
  label TEXT NOT NULL,
  quantity_text TEXT NOT NULL,
  per_unit_text TEXT,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  regular_price DECIMAL(12, 2),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  price_html TEXT NOT NULL DEFAULT '',
  attributes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, variant_id)
);

CREATE INDEX idx_catalog_variants_product_id ON public.catalog_variants(product_id);

COMMENT ON TABLE public.catalog_variants IS 'Package/variant options per catalog product; cart uses slug::variant_id';

-- catalog_faqs: one row per FAQ per product
CREATE TABLE IF NOT EXISTS public.catalog_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.catalog_products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_catalog_faqs_product_id ON public.catalog_faqs(product_id);

COMMENT ON TABLE public.catalog_faqs IS 'Product FAQs; sort_order preserves display order';

-- catalog_import_meta: audit log of import runs (optional)
CREATE TABLE IF NOT EXISTS public.catalog_import_meta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generated_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  sitemap_url TEXT NOT NULL,
  product_count INTEGER NOT NULL CHECK (product_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.catalog_import_meta IS 'Audit log for catalog import runs';

-- Updated_at triggers
CREATE TRIGGER set_catalog_products_updated_at
  BEFORE UPDATE ON public.catalog_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_catalog_variants_updated_at
  BEFORE UPDATE ON public.catalog_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_catalog_faqs_updated_at
  BEFORE UPDATE ON public.catalog_faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_import_meta ENABLE ROW LEVEL SECURITY;

-- Catalog: public read; only admins write
CREATE POLICY "Catalog products are viewable by everyone"
  ON public.catalog_products FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage catalog products"
  ON public.catalog_products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Catalog variants are viewable by everyone"
  ON public.catalog_variants FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage catalog variants"
  ON public.catalog_variants FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Catalog faqs are viewable by everyone"
  ON public.catalog_faqs FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage catalog faqs"
  ON public.catalog_faqs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Import meta: public read (transparency), admins insert
CREATE POLICY "Catalog import meta is viewable by everyone"
  ON public.catalog_import_meta FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert catalog import meta"
  ON public.catalog_import_meta FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
