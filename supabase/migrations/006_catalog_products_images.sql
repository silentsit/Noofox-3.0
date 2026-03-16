-- Add images column to catalog_products for Storage URLs or external URLs
ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.catalog_products.images IS 'Product image URLs (Supabase Storage or external); first used as hero/thumbnail';
