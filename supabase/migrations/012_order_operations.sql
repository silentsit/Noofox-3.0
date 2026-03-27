-- Order operations upgrade for denser admin workflows and audit-friendly fulfillment.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0),
  ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS currency_code TEXT NOT NULL DEFAULT 'USD' CHECK (currency_code = 'USD'),
  ADD COLUMN IF NOT EXISTS attribution_source TEXT,
  ADD COLUMN IF NOT EXISTS attribution_detail TEXT,
  ADD COLUMN IF NOT EXISTS crypto_txid TEXT,
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT,
  ADD COLUMN IF NOT EXISTS payment_metadata JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON public.orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON public.orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_orders_crypto_txid ON public.orders(crypto_txid);
CREATE INDEX IF NOT EXISTS idx_orders_attribution_source ON public.orders(attribution_source);

CREATE TABLE IF NOT EXISTS public.order_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL DEFAULT 'system' CHECK (entry_type IN ('system', 'note')),
  message TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id_created_at
  ON public.order_timeline(order_id, created_at DESC);

COMMENT ON TABLE public.order_timeline IS 'Chronological timeline ledger of order events and private notes';

CREATE OR REPLACE FUNCTION public.append_order_timeline(
  p_order_id UUID,
  p_entry_type TEXT,
  p_message TEXT,
  p_is_private BOOLEAN DEFAULT false,
  p_actor_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  timeline_id UUID;
BEGIN
  INSERT INTO public.order_timeline (
    order_id,
    entry_type,
    message,
    is_private,
    actor_id,
    metadata
  )
  VALUES (
    p_order_id,
    COALESCE(NULLIF(p_entry_type, ''), 'system'),
    p_message,
    COALESCE(p_is_private, false),
    p_actor_id,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO timeline_id;

  RETURN timeline_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.append_order_timeline(UUID, TEXT, TEXT, BOOLEAN, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.append_order_timeline(UUID, TEXT, TEXT, BOOLEAN, UUID, JSONB) TO service_role;

ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read visible timeline for own orders"
  ON public.order_timeline
  FOR SELECT
  USING (
    public.is_admin_user(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_timeline.order_id
        AND o.user_id = auth.uid()
        AND order_timeline.is_private = false
    )
  );

CREATE POLICY "Admins can insert order timeline"
  ON public.order_timeline
  FOR INSERT
  WITH CHECK (public.is_admin_user(auth.uid()));
