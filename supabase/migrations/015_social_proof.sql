-- Social proof / TrustPulse-style campaigns

CREATE TABLE IF NOT EXISTS public.social_proof_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  display_mode TEXT NOT NULL DEFAULT 'mixed' CHECK (display_mode IN ('live', 'evergreen', 'mixed')),
  message_template TEXT NOT NULL DEFAULT '{{city}} · {{product}}',
  link_url TEXT,
  delay_ms INTEGER NOT NULL DEFAULT 4000 CHECK (delay_ms >= 0),
  min_interval_ms INTEGER NOT NULL DEFAULT 15000 CHECK (min_interval_ms >= 1000),
  max_interval_ms INTEGER NOT NULL DEFAULT 40000 CHECK (max_interval_ms >= min_interval_ms),
  page_include TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  page_exclude TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  evergreen_pool JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_proof_campaigns_active ON public.social_proof_campaigns(is_active);

DROP TRIGGER IF EXISTS set_social_proof_campaigns_updated_at ON public.social_proof_campaigns;
CREATE TRIGGER set_social_proof_campaigns_updated_at
  BEFORE UPDATE ON public.social_proof_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.social_proof_campaigns ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read active social proof' AND tablename = 'social_proof_campaigns') THEN
    CREATE POLICY "Anyone can read active social proof"
      ON public.social_proof_campaigns
      FOR SELECT
      USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage social proof campaigns' AND tablename = 'social_proof_campaigns') THEN
    CREATE POLICY "Admins manage social proof campaigns"
      ON public.social_proof_campaigns
      FOR ALL
      USING (public.check_admin_permission(auth.uid(), 'write', 'social_proof'))
      WITH CHECK (public.check_admin_permission(auth.uid(), 'write', 'social_proof'));
  END IF;
END $$;
