import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { triggerEmail } from '@/lib/email';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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

  return NextResponse.json({ ok: true });
}
