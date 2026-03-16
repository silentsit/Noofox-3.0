-- Optional stock tracking per catalog variant (admin can adjust; decrement on order completion can be wired later)
ALTER TABLE public.catalog_variants
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;

COMMENT ON COLUMN public.catalog_variants.stock_quantity IS 'Optional stock; NULL = no tracking; set and adjust in admin';
