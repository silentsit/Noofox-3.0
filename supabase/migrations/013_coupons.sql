-- Coupon / promotional engine.
-- Supports percentage and fixed discounts, min-order thresholds,
-- usage caps (global + per-customer), and expiry dates.

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(12, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  max_discount_amount DECIMAL(12, 2) CHECK (max_discount_amount IS NULL OR max_discount_amount > 0),
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
  usage_limit_per_user INTEGER CHECK (usage_limit_per_user IS NULL OR usage_limit_per_user > 0),
  times_used INTEGER NOT NULL DEFAULT 0 CHECK (times_used >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage coupons' AND tablename = 'coupons') THEN
    CREATE POLICY "Admins can manage coupons"
      ON public.coupons
      FOR ALL
      USING (public.is_admin_user(auth.uid()))
      WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;

-- Service role can read coupons for checkout validation (no user session needed for guest checkout)
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT ON public.coupons TO authenticated;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read active coupons by code' AND tablename = 'coupons') THEN
    CREATE POLICY "Anyone can read active coupons by code"
      ON public.coupons
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- Track per-user coupon usage
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON public.coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON public.coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_customer_email ON public.coupon_usages(customer_email);

ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Atomic increment for coupon usage counter
CREATE OR REPLACE FUNCTION public.increment_coupon_times_used(p_coupon_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET times_used = times_used + 1,
      updated_at = NOW()
  WHERE id = p_coupon_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_coupon_times_used(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_times_used(UUID) TO service_role;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage coupon usages' AND tablename = 'coupon_usages') THEN
    CREATE POLICY "Admins can manage coupon usages"
      ON public.coupon_usages
      FOR ALL
      USING (public.is_admin_user(auth.uid()))
      WITH CHECK (public.is_admin_user(auth.uid()));
  END IF;
END $$;
