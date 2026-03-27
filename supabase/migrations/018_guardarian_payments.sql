-- Guardarian transaction tracking and idempotent webhook ingestion.

CREATE TABLE IF NOT EXISTS public.guardarian_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  guardarian_tx_id TEXT,
  external_partner_link_id TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  from_currency TEXT,
  to_currency TEXT,
  fiat_amount DECIMAL(12, 2),
  crypto_amount DECIMAL(24, 10),
  destination_address TEXT,
  tx_hash TEXT,
  payment_reference TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guardarian_transactions_order_id
  ON public.guardarian_transactions(order_id);

CREATE INDEX IF NOT EXISTS idx_guardarian_transactions_status
  ON public.guardarian_transactions(status);

CREATE INDEX IF NOT EXISTS idx_guardarian_transactions_guardarian_tx_id
  ON public.guardarian_transactions(guardarian_tx_id);

CREATE TABLE IF NOT EXISTS public.guardarian_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES public.guardarian_transactions(id) ON DELETE SET NULL,
  event_key TEXT NOT NULL UNIQUE,
  event_id TEXT,
  status TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guardarian_events_order_id
  ON public.guardarian_events(order_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_guardarian_events_transaction_id
  ON public.guardarian_events(transaction_id, received_at DESC);

ALTER TABLE public.guardarian_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardarian_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guardarian_transactions'
      AND policyname = 'Service role manages guardarian transactions'
  ) THEN
    CREATE POLICY "Service role manages guardarian transactions"
      ON public.guardarian_transactions
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guardarian_events'
      AND policyname = 'Service role manages guardarian events'
  ) THEN
    CREATE POLICY "Service role manages guardarian events"
      ON public.guardarian_events
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_guardarian_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guardarian_transactions_updated_at ON public.guardarian_transactions;
CREATE TRIGGER trg_guardarian_transactions_updated_at
  BEFORE UPDATE ON public.guardarian_transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_guardarian_updated_at();
