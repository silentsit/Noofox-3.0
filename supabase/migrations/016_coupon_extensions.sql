-- Extended coupon rules (partial Apex spec)

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS allow_free_shipping BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exclude_sale_items BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS product_ids TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS category_slugs TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS email_allowlist TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS brand_keys TEXT[] NOT NULL DEFAULT '{}'::text[];

COMMENT ON COLUMN public.coupons.product_ids IS 'If non-empty, coupon applies only when cart line slugs (catalog slug prefix of product_id) match.';
COMMENT ON COLUMN public.coupons.category_slugs IS 'If non-empty, coupon applies only when all cart products belong to these category slugs.';
COMMENT ON COLUMN public.coupons.email_allowlist IS 'If non-empty, only these emails (lowercase) may use the coupon.';
