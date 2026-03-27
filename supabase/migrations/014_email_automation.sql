-- Email automation: templates, automations, queue, broadcasts, subscribers, abandoned carts.

CREATE TABLE IF NOT EXISTS public.email_templates (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  audience TEXT NOT NULL DEFAULT 'customer' CHECK (audience IN ('customer', 'admin', 'marketing', 'internal')),
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_automations (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  event_key TEXT NOT NULL,
  template_key TEXT NOT NULL REFERENCES public.email_templates(key) ON DELETE CASCADE,
  audience TEXT NOT NULL DEFAULT 'customer' CHECK (audience IN ('customer', 'admin', 'marketing', 'internal')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  delay_minutes INTEGER NOT NULL DEFAULT 0 CHECK (delay_minutes >= 0),
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_key TEXT REFERENCES public.email_automations(key) ON DELETE SET NULL,
  template_key TEXT REFERENCES public.email_templates(key) ON DELETE SET NULL,
  event_key TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subject TEXT,
  html_body TEXT,
  text_body TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  send_after TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  segment_key TEXT NOT NULL DEFAULT 'subscribers',
  coupon_code TEXT,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sent', 'cancelled')),
  sent_count INTEGER NOT NULL DEFAULT 0 CHECK (sent_count >= 0),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  email TEXT PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  source TEXT NOT NULL DEFAULT 'checkout',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_marketing_email_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_email TEXT UNIQUE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0),
  coupon_code TEXT,
  payment_choice TEXT,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_email_sent_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_automations_event_key ON public.email_automations(event_key);
CREATE INDEX IF NOT EXISTS idx_email_queue_status_send_after ON public.email_queue(status, send_after);
CREATE INDEX IF NOT EXISTS idx_email_queue_recipient ON public.email_queue(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_broadcasts_status ON public.email_broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON public.email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_last_activity ON public.abandoned_carts(last_activity_at);

DROP TRIGGER IF EXISTS set_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER set_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_email_automations_updated_at ON public.email_automations;
CREATE TRIGGER set_email_automations_updated_at
  BEFORE UPDATE ON public.email_automations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_email_queue_updated_at ON public.email_queue;
CREATE TRIGGER set_email_queue_updated_at
  BEFORE UPDATE ON public.email_queue
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_email_broadcasts_updated_at ON public.email_broadcasts;
CREATE TRIGGER set_email_broadcasts_updated_at
  BEFORE UPDATE ON public.email_broadcasts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_email_subscribers_updated_at ON public.email_subscribers;
CREATE TRIGGER set_email_subscribers_updated_at
  BEFORE UPDATE ON public.email_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_abandoned_carts_updated_at ON public.abandoned_carts;
CREATE TRIGGER set_abandoned_carts_updated_at
  BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage email templates' AND tablename = 'email_templates') THEN
    CREATE POLICY "Admins can manage email templates"
      ON public.email_templates
      FOR ALL
      USING (public.check_admin_permission(auth.uid(), 'write', 'email'))
      WITH CHECK (public.check_admin_permission(auth.uid(), 'write', 'email'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage email automations' AND tablename = 'email_automations') THEN
    CREATE POLICY "Admins can manage email automations"
      ON public.email_automations
      FOR ALL
      USING (public.check_admin_permission(auth.uid(), 'write', 'email'))
      WITH CHECK (public.check_admin_permission(auth.uid(), 'write', 'email'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage email queue' AND tablename = 'email_queue') THEN
    CREATE POLICY "Admins can manage email queue"
      ON public.email_queue
      FOR ALL
      USING (public.check_admin_permission(auth.uid(), 'write', 'email'))
      WITH CHECK (public.check_admin_permission(auth.uid(), 'write', 'email'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage email broadcasts' AND tablename = 'email_broadcasts') THEN
    CREATE POLICY "Admins can manage email broadcasts"
      ON public.email_broadcasts
      FOR ALL
      USING (public.check_admin_permission(auth.uid(), 'write', 'email'))
      WITH CHECK (public.check_admin_permission(auth.uid(), 'write', 'email'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage email subscribers' AND tablename = 'email_subscribers') THEN
    CREATE POLICY "Admins can manage email subscribers"
      ON public.email_subscribers
      FOR ALL
      USING (public.check_admin_permission(auth.uid(), 'write', 'email'))
      WITH CHECK (public.check_admin_permission(auth.uid(), 'write', 'email'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage abandoned carts' AND tablename = 'abandoned_carts') THEN
    CREATE POLICY "Admins can manage abandoned carts"
      ON public.abandoned_carts
      FOR ALL
      USING (public.check_admin_permission(auth.uid(), 'write', 'email'))
      WITH CHECK (public.check_admin_permission(auth.uid(), 'write', 'email'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can create subscribers' AND tablename = 'email_subscribers') THEN
    CREATE POLICY "Public can create subscribers"
      ON public.email_subscribers
      FOR INSERT
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can update own subscriber email records' AND tablename = 'email_subscribers') THEN
    CREATE POLICY "Public can update own subscriber email records"
      ON public.email_subscribers
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert abandoned carts' AND tablename = 'abandoned_carts') THEN
    CREATE POLICY "Public can insert abandoned carts"
      ON public.abandoned_carts
      FOR INSERT
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can update abandoned carts' AND tablename = 'abandoned_carts') THEN
    CREATE POLICY "Public can update abandoned carts"
      ON public.abandoned_carts
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

INSERT INTO public.email_templates (key, name, description, audience, subject_template, html_template, text_template, is_system)
VALUES
  ('order_placed', 'Order received', 'Customer confirmation after checkout', 'customer', 'Order received #{{order_short_id}} - complete payment', '<p>Hi {{customer_email}},</p><p>We received your order <strong>#{{order_short_id}}</strong>. Complete payment to continue.</p><p>Total: <strong>{{total_amount_formatted}}</strong></p>', 'Hi {{customer_email}},\n\nWe received your order #{{order_short_id}}. Complete payment to continue.\n\nTotal: {{total_amount_formatted}}', true),
  ('order_received', 'Payment received', 'Customer confirmation after payment is verified', 'customer', 'Payment received - Order #{{order_short_id}}', '<p>Payment received for order <strong>#{{order_short_id}}</strong>. We are preparing your order now.</p>', 'Payment received for order #{{order_short_id}}. We are preparing your order now.', true),
  ('order_on_hold', 'Order on hold', 'Customer message for on-hold orders', 'customer', 'Order #{{order_short_id}} on hold', '<p>Your order <strong>#{{order_short_id}}</strong> is on hold. We''ll contact you if anything is needed.</p>', 'Your order #{{order_short_id}} is on hold. We''ll contact you if anything is needed.', true),
  ('order_shipped', 'Order shipped', 'Shipping confirmation email', 'customer', 'Your order #{{order_short_id}} has shipped', '<p>Your order <strong>#{{order_short_id}}</strong> has shipped.</p><p>Tracking: <strong>{{tracking_id}}</strong></p>', 'Your order #{{order_short_id}} has shipped.\nTracking: {{tracking_id}}', true),
  ('order_completed', 'Order complete', 'Customer completion email', 'customer', 'Order #{{order_short_id}} complete', '<p>Your order <strong>#{{order_short_id}}</strong> is complete. Thank you for shopping with us.</p>', 'Your order #{{order_short_id}} is complete. Thank you for shopping with us.', true),
  ('order_cancelled', 'Order cancelled', 'Customer cancellation email', 'customer', 'Order #{{order_short_id}} cancelled', '<p>Your order <strong>#{{order_short_id}}</strong> has been cancelled.</p>', 'Your order #{{order_short_id}} has been cancelled.', true),
  ('order_refunded', 'Refund processed', 'Customer refund email', 'customer', 'Refund processed - Order #{{order_short_id}}', '<p>Your refund for order <strong>#{{order_short_id}}</strong> has been processed.</p>', 'Your refund for order #{{order_short_id}} has been processed.', true),
  ('order_payment_failed', 'Payment failed', 'Customer payment failure email', 'customer', 'Payment failed - Order #{{order_short_id}}', '<p>Payment for order <strong>#{{order_short_id}}</strong> failed. Your cart is preserved, so please try again.</p>', 'Payment for order #{{order_short_id}} failed. Your cart is preserved, so please try again.', true),
  ('admin_new_order', 'Admin new order', 'Alert admins about a new order', 'admin', 'New order #{{order_short_id}} - {{total_amount_formatted}}', '<p>New order <strong>#{{order_short_id}}</strong> from {{customer_email}}.</p><p>Total: <strong>{{total_amount_formatted}}</strong></p>', 'New order #{{order_short_id}} from {{customer_email}}.\nTotal: {{total_amount_formatted}}', true),
  ('admin_payment_failed', 'Admin payment failed', 'Alert admins about failed payment', 'admin', 'Order #{{order_short_id}} payment failed', '<p>Order <strong>#{{order_short_id}}</strong> payment failed.</p><p>Customer: {{customer_email}}</p>', 'Order #{{order_short_id}} payment failed.\nCustomer: {{customer_email}}', true),
  ('admin_order_cancelled', 'Admin order cancelled', 'Alert admins about cancelled order', 'admin', 'Order #{{order_short_id}} cancelled', '<p>Order <strong>#{{order_short_id}}</strong> was cancelled.</p>', 'Order #{{order_short_id}} was cancelled.', true),
  ('admin_order_refunded', 'Admin order refunded', 'Alert admins about refunded order', 'admin', 'Order #{{order_short_id}} refunded', '<p>Order <strong>#{{order_short_id}}</strong> was refunded.</p>', 'Order #{{order_short_id}} was refunded.', true),
  ('admin_high_value_order', 'Admin high-value order', 'Alert admins about high-value orders', 'admin', 'High-value order #{{order_short_id}}', '<p>High-value order <strong>#{{order_short_id}}</strong> from {{customer_email}}.</p><p>Total: <strong>{{total_amount_formatted}}</strong></p>', 'High-value order #{{order_short_id}} from {{customer_email}}.\nTotal: {{total_amount_formatted}}', true),
  ('password_reset_link', 'Password reset link', 'Customer password reset email', 'customer', 'Reset your GrabModa password', '<p>Use this link to reset your password:</p><p><a href="{{reset_link}}">{{reset_link}}</a></p><p>If you did not request this, you can ignore this email.</p>', 'Use this link to reset your password:\n{{reset_link}}\n\nIf you did not request this, you can ignore this email.', true),
  ('welcome_email', 'Welcome series', 'Welcome email for new registrations', 'customer', 'Welcome to GrabModa', '<p>Welcome to GrabModa, {{customer_email}}.</p><p>You are now part of our community focused on Cognitive Enhancement, Meditation, and Repurposed Medication.</p>', 'Welcome to GrabModa, {{customer_email}}.\n\nYou are now part of our community focused on Cognitive Enhancement, Meditation, and Repurposed Medication.', true),
  ('abandoned_cart', 'Abandoned cart recovery', 'Recovery email for incomplete checkouts', 'marketing', 'You left something behind at GrabModa', '<p>You left products in your cart.</p><p>Subtotal: <strong>{{subtotal_amount_formatted}}</strong></p><p>{{coupon_message}}</p>', 'You left products in your cart.\nSubtotal: {{subtotal_amount_formatted}}\n{{coupon_message}}', true),
  ('review_reminder', 'Review reminder', 'Post-purchase review request', 'customer', 'How did your order #{{order_short_id}} go?', '<p>We hope your order <strong>#{{order_short_id}}</strong> arrived safely.</p><p>Reply to this email and let us know how it went.</p>', 'We hope your order #{{order_short_id}} arrived safely.\nReply to this email and let us know how it went.', true)
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  audience = EXCLUDED.audience,
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  text_template = EXCLUDED.text_template,
  is_system = EXCLUDED.is_system;

INSERT INTO public.email_automations (key, name, event_key, template_key, audience, enabled, delay_minutes, filters)
VALUES
  ('order_placed', 'Order placed', 'order_placed', 'order_placed', 'customer', true, 0, '{}'::jsonb),
  ('order_received', 'Order received', 'order_received', 'order_received', 'customer', true, 0, '{}'::jsonb),
  ('order_on_hold', 'Order on hold', 'order_on_hold', 'order_on_hold', 'customer', true, 0, '{}'::jsonb),
  ('order_shipped', 'Order shipped', 'order_shipped', 'order_shipped', 'customer', true, 0, '{}'::jsonb),
  ('order_completed', 'Order completed', 'order_completed', 'order_completed', 'customer', true, 0, '{}'::jsonb),
  ('order_cancelled', 'Order cancelled', 'order_cancelled', 'order_cancelled', 'customer', true, 0, '{}'::jsonb),
  ('order_refunded', 'Order refunded', 'order_refunded', 'order_refunded', 'customer', true, 0, '{}'::jsonb),
  ('order_payment_failed', 'Order payment failed', 'order_payment_failed', 'order_payment_failed', 'customer', true, 0, '{}'::jsonb),
  ('admin_new_order', 'Admin new order', 'admin_new_order', 'admin_new_order', 'admin', true, 0, '{}'::jsonb),
  ('admin_payment_failed', 'Admin payment failed', 'admin_payment_failed', 'admin_payment_failed', 'admin', true, 0, '{}'::jsonb),
  ('admin_order_cancelled', 'Admin order cancelled', 'admin_order_cancelled', 'admin_order_cancelled', 'admin', true, 0, '{}'::jsonb),
  ('admin_order_refunded', 'Admin order refunded', 'admin_order_refunded', 'admin_order_refunded', 'admin', true, 0, '{}'::jsonb),
  ('admin_high_value_order', 'Admin high-value order', 'admin_high_value_order', 'admin_high_value_order', 'admin', true, 0, '{}'::jsonb),
  ('password_reset_link', 'Password reset', 'password_reset_link', 'password_reset_link', 'customer', true, 0, '{}'::jsonb),
  ('welcome_email', 'Welcome email', 'welcome_email', 'welcome_email', 'customer', true, 0, '{}'::jsonb),
  ('abandoned_cart', 'Abandoned cart', 'abandoned_cart', 'abandoned_cart', 'marketing', true, 180, '{}'::jsonb),
  ('review_reminder', 'Review reminder', 'review_reminder', 'review_reminder', 'customer', true, 10080, '{}'::jsonb)
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  event_key = EXCLUDED.event_key,
  template_key = EXCLUDED.template_key,
  audience = EXCLUDED.audience,
  enabled = EXCLUDED.enabled,
  delay_minutes = EXCLUDED.delay_minutes,
  filters = EXCLUDED.filters;
