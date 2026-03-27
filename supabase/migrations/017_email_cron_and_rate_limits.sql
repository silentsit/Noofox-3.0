-- Add DB-backed request throttling and welcome-series automation seeds.

CREATE TABLE IF NOT EXISTS public.request_rate_limits (
  key TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_rate_limits_scope_window
  ON public.request_rate_limits(scope, window_start DESC);

ALTER TABLE public.request_rate_limits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role manages request_rate_limits' AND tablename = 'request_rate_limits') THEN
    CREATE POLICY "Service role manages request_rate_limits"
      ON public.request_rate_limits
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

INSERT INTO public.email_templates (key, name, description, audience, subject_template, html_template, text_template, is_system, is_active)
VALUES
  (
    'welcome_series_day_2',
    'Welcome series day 2',
    'Follow-up email after onboarding',
    'customer',
    'How to get the most from GrabModa',
    '<p>Thanks for joining GrabModa.</p><p>If you are new, start with lower doses and keep a consistent routine.</p><p>Explore products: <a href="{{site_url}}/shop">{{site_url}}/shop</a></p>',
    'Thanks for joining GrabModa.\nIf you are new, start with lower doses and keep a consistent routine.\nExplore products: {{site_url}}/shop',
    true,
    true
  ),
  (
    'welcome_series_day_7',
    'Welcome series day 7',
    'Second onboarding follow-up',
    'customer',
    'Your first week with GrabModa',
    '<p>It has been one week since you joined.</p><p>Need help choosing products? Reply to this email and our team will guide you.</p><p>Community: {{site_url}}</p>',
    'It has been one week since you joined.\nNeed help choosing products? Reply to this email and our team will guide you.\nCommunity: {{site_url}}',
    true,
    true
  )
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  audience = EXCLUDED.audience,
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  text_template = EXCLUDED.text_template,
  is_system = EXCLUDED.is_system,
  is_active = EXCLUDED.is_active;

INSERT INTO public.email_automations (key, name, event_key, template_key, audience, enabled, delay_minutes, filters)
VALUES
  ('welcome_series_day_2', 'Welcome series - day 2', 'welcome_series_day_2', 'welcome_series_day_2', 'customer', true, 2880, '{}'::jsonb),
  ('welcome_series_day_7', 'Welcome series - day 7', 'welcome_series_day_7', 'welcome_series_day_7', 'customer', true, 10080, '{}'::jsonb)
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  event_key = EXCLUDED.event_key,
  template_key = EXCLUDED.template_key,
  audience = EXCLUDED.audience,
  enabled = EXCLUDED.enabled,
  delay_minutes = EXCLUDED.delay_minutes,
  filters = EXCLUDED.filters;
