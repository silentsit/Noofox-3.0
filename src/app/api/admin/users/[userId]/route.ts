import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/audit';
import { requireAdminRoute } from '@/lib/rbac';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const auth = await requireAdminRoute({ action: 'write', resource: 'users' });
  if (auth.response) return auth.response;

  const supabase = await createClient();
  if (userId === auth.admin.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const targetProfile = await supabase.from('users').select('role').eq('id', userId).single();
  if (targetProfile?.data?.role === 'admin') {
    return NextResponse.json({ error: 'Cannot delete an admin user' }, { status: 400 });
  }

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 500 });
  }

  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'delete',
    resourceType: 'user',
    resourceId: userId,
    oldData: targetProfile.data,
  });

  return NextResponse.json({ ok: true });
}
