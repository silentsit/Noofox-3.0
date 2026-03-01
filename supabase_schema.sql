-- Noofox E-commerce Schema (HPOS-style, high-performance, indexed)
-- Run in Supabase SQL Editor. For fresh install use as-is; for existing DB run the ALTER blocks below.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  profile_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  images TEXT[] DEFAULT '{}',
  stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Order status enum (logical; we use CHECK for compatibility)
-- Pending Payment, Processing, On Hold, Completed, Cancelled, Refunded, Failed
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'Pending Payment' CHECK (status IN (
    'Pending Payment', 'Processing', 'On Hold', 'Completed', 'Cancelled', 'Refunded', 'Failed'
  )),
  total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
  tracking_id TEXT,
  payment_method TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  internal_notes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
CREATE POLICY "Only admins can manage products" ON public.products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can update orders" ON public.orders;
CREATE POLICY "Only admins can update orders" ON public.orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Guest order reconciliation: link past guest orders to new user by email (must exist before handle_new_user trigger)
CREATE OR REPLACE FUNCTION public.reconcile_guest_orders(p_user_id UUID, p_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET user_id = p_user_id, updated_at = NOW()
  WHERE customer_email = p_email AND (user_id IS NULL OR user_id != p_user_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.reconcile_guest_orders(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_guest_orders(UUID, TEXT) TO service_role;

-- New user profile on signup + guest order reconciliation (link orders where customer_email = new user email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  p_email TEXT;
BEGIN
  INSERT INTO public.users (id, email, role, profile_data)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    'customer',
    jsonb_build_object(
      'full_name', COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'avatar_url', NEW.raw_user_meta_data->>'avatar_url'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  p_email := LOWER(TRIM(COALESCE(NEW.email, '')));
  IF p_email != '' THEN
    PERFORM public.reconcile_guest_orders(NEW.id, p_email);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Inventory reversal: add stock back when order is cancelled/refunded/failed (optional; reconcile_guest_orders already defined above)
CREATE OR REPLACE FUNCTION public.increment_product_stock(p_product_id UUID, p_delta INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock_count = GREATEST(0, stock_count + p_delta), updated_at = NOW()
  WHERE id = p_product_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_product_stock(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_product_stock(UUID, INTEGER) TO service_role;

-- Optional: if orders table already exists without new columns, run:
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_agent TEXT;
-- ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS internal_notes JSONB DEFAULT '[]';
-- Then update status CHECK to include Refunded, Failed (drop and re-add constraint if needed):
-- ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
-- ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN (
--   'Pending Payment', 'Processing', 'On Hold', 'Completed', 'Cancelled', 'Refunded', 'Failed'
-- ));
-- CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
