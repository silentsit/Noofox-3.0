-- Immutable audit trail for privileged admin actions.

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON public.audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

COMMENT ON TABLE public.audit_log IS 'Audit ledger for privileged admin mutations and fulfillment actions';

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
  ON public.audit_log
  FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert audit log"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (public.is_admin_user(auth.uid()));
