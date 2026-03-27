-- Granular admin RBAC built on top of the existing public.users table.
-- Keeps legacy users.role = 'admin' working while introducing assignable roles.

CREATE TABLE IF NOT EXISTS public.admin_roles (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_permissions (
  key TEXT PRIMARY KEY,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
  role_key TEXT NOT NULL REFERENCES public.admin_roles(key) ON DELETE CASCADE,
  permission_key TEXT NOT NULL REFERENCES public.admin_permissions(key) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_key, permission_key)
);

CREATE TABLE IF NOT EXISTS public.user_admin_roles (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL REFERENCES public.admin_roles(key) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_key)
);

CREATE INDEX IF NOT EXISTS idx_user_admin_roles_role_key ON public.user_admin_roles(role_key);

INSERT INTO public.admin_roles (key, name, description)
VALUES
  ('super_admin', 'Super Admin', 'Full access across the platform'),
  ('store_manager', 'Store Manager', 'Catalog, orders, coupons, analytics, and marketing operations'),
  ('support', 'Support', 'Customer, order, and fulfillment support access')
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.admin_permissions (key, resource, action, description)
VALUES
  ('read:dashboard', 'dashboard', 'read', 'View admin dashboard metrics'),
  ('read:orders', 'orders', 'read', 'View orders and fulfillment details'),
  ('write:orders', 'orders', 'write', 'Update orders, fulfillment, and notes'),
  ('read:products', 'products', 'read', 'View products and variants'),
  ('write:products', 'products', 'write', 'Create and update products and variants'),
  ('read:blog', 'blog', 'read', 'View blog and CMS entries'),
  ('write:blog', 'blog', 'write', 'Manage blog and CMS entries'),
  ('read:media', 'media', 'read', 'Browse media library'),
  ('write:media', 'media', 'write', 'Upload and update media'),
  ('read:users', 'users', 'read', 'View users and customers'),
  ('write:users', 'users', 'write', 'Manage users and credentials'),
  ('read:settings', 'settings', 'read', 'View platform settings'),
  ('write:settings', 'settings', 'write', 'Manage platform settings'),
  ('read:analytics', 'analytics', 'read', 'View analytics and reporting'),
  ('write:analytics', 'analytics', 'write', 'Manage analytics configuration'),
  ('read:coupons', 'coupons', 'read', 'View coupons and promotional settings'),
  ('write:coupons', 'coupons', 'write', 'Manage coupons and promotions'),
  ('read:email', 'email', 'read', 'View email templates and queues'),
  ('write:email', 'email', 'write', 'Manage transactional and marketing email'),
  ('read:social_proof', 'social_proof', 'read', 'View social proof campaigns'),
  ('write:social_proof', 'social_proof', 'write', 'Manage social proof campaigns'),
  ('read:audit_log', 'audit_log', 'read', 'Review admin activity history')
ON CONFLICT (key) DO UPDATE
SET
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description;

INSERT INTO public.admin_role_permissions (role_key, permission_key)
SELECT 'super_admin', key
FROM public.admin_permissions
ON CONFLICT DO NOTHING;

INSERT INTO public.admin_role_permissions (role_key, permission_key)
VALUES
  ('store_manager', 'read:dashboard'),
  ('store_manager', 'read:orders'),
  ('store_manager', 'write:orders'),
  ('store_manager', 'read:products'),
  ('store_manager', 'write:products'),
  ('store_manager', 'read:media'),
  ('store_manager', 'write:media'),
  ('store_manager', 'read:blog'),
  ('store_manager', 'write:blog'),
  ('store_manager', 'read:analytics'),
  ('store_manager', 'read:coupons'),
  ('store_manager', 'write:coupons'),
  ('store_manager', 'read:email'),
  ('store_manager', 'write:email'),
  ('store_manager', 'read:social_proof'),
  ('store_manager', 'write:social_proof'),
  ('store_manager', 'read:audit_log'),
  ('support', 'read:dashboard'),
  ('support', 'read:orders'),
  ('support', 'write:orders'),
  ('support', 'read:users'),
  ('support', 'read:media')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = p_user_id
      AND u.role = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_admin_roles uar
    WHERE uar.user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.check_admin_permission(
  p_user_id UUID,
  p_action TEXT,
  p_resource TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = p_user_id
        AND u.role = 'admin'
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_admin_roles uar
      WHERE uar.user_id = p_user_id
        AND uar.role_key = 'super_admin'
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_admin_roles uar
      JOIN public.admin_role_permissions arp
        ON arp.role_key = uar.role_key
      JOIN public.admin_permissions ap
        ON ap.key = arp.permission_key
      WHERE uar.user_id = p_user_id
        AND ap.action = p_action
        AND ap.resource = p_resource
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_permission(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_admin_permission(UUID, TEXT, TEXT) TO service_role;

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin roles"
  ON public.admin_roles
  FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can read admin permissions"
  ON public.admin_permissions
  FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can read admin role permissions"
  ON public.admin_role_permissions
  FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can read user admin roles"
  ON public.user_admin_roles
  FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Super admins can manage user admin roles"
  ON public.user_admin_roles
  FOR ALL
  USING (public.check_admin_permission(auth.uid(), 'write', 'settings'))
  WITH CHECK (public.check_admin_permission(auth.uid(), 'write', 'settings'));
