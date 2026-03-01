-- Add HPOS columns to orders if upgrading from 001_schema
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS internal_notes JSONB DEFAULT '[]';

-- Expand status enum to include Refunded, Failed
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'Pending Payment', 'Processing', 'On Hold', 'Completed', 'Cancelled', 'Refunded', 'Failed'
));

CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);

-- Inventory reversal for admin order status changes
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
