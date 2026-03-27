import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { triggerEmail } from '@/lib/email';
import { writeAuditLog } from '@/lib/audit';
import { requireAdminRoute } from '@/lib/rbac';

export async function POST(request: Request) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'users' });
  if (auth.response) return auth.response;

  const supabase = await createClient();

  const body = await request.json().catch(() => ({}));
  const email = (body.email as string)?.trim();
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: 'Service role not configured' }, { status: 500 });
  }

  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { error: linkError?.message ?? 'Could not generate reset link' },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  await triggerEmail(baseUrl, 'password_reset_link', {
    customer_email: email,
    reset_link: linkData.properties.action_link,
  });

  await writeAuditLog({
    action: 'send_reset_link',
    resourceType: 'user',
    resourceId: email,
    newData: { email },
  });

  return NextResponse.json({ ok: true });
}
