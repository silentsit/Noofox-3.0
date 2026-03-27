import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export type AdminPermission = {
  action: string;
  resource: string;
};

export type AdminProfile = {
  id: string;
  email: string;
  role: 'admin' | 'customer';
};

export type AdminContext = {
  user: User;
  profile: AdminProfile | null;
  roleKeys: string[];
  permissionKeys: string[];
  isAdmin: boolean;
  isLegacyAdmin: boolean;
  hasPermission: (permission: AdminPermission) => boolean;
};

function matchesPermission(keys: string[], permission: AdminPermission) {
  const target = `${permission.action}:${permission.resource}`;
  return keys.includes(target);
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', user.id)
    .single<AdminProfile>();

  const { data: roleData } = await supabase
    .from('user_admin_roles')
    .select('role_key')
    .eq('user_id', user.id);

  const roleKeys = Array.from(
    new Set((roleData ?? []).map((row) => row.role_key).filter(Boolean))
  );

  const permissionRows =
    roleKeys.length > 0
      ? await supabase
          .from('admin_role_permissions')
          .select('permission_key')
          .in('role_key', roleKeys)
      : { data: [] as { permission_key: string }[] };

  const permissionKeys = Array.from(
    new Set(
      (permissionRows.data ?? []).map((row) => row.permission_key).filter(Boolean)
    )
  );

  const isLegacyAdmin = profile?.role === 'admin';
  const isAdmin = isLegacyAdmin || roleKeys.length > 0;

  return {
    user,
    profile: profile ?? null,
    roleKeys,
    permissionKeys,
    isAdmin,
    isLegacyAdmin,
    hasPermission(permission) {
      if (isLegacyAdmin || roleKeys.includes('super_admin')) {
        return true;
      }

      return matchesPermission(permissionKeys, permission);
    },
  };
}

export async function requireAdminPage(permission?: AdminPermission) {
  const admin = await getAdminContext();

  if (!admin?.user) {
    redirect('/login?redirectTo=/admin');
  }

  if (!admin.isAdmin) {
    redirect('/dashboard');
  }

  if (permission && !admin.hasPermission(permission)) {
    redirect('/admin');
  }

  return admin;
}

export async function requireAdminRoute(permission?: AdminPermission) {
  const admin = await getAdminContext();

  if (!admin?.user) {
    return {
      admin: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (!admin.isAdmin) {
    return {
      admin: null,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  if (permission && !admin.hasPermission(permission)) {
    return {
      admin: null,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    admin,
    response: null,
  };
}
