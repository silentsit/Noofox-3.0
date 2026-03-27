import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createBroadcastAndQueue } from '@/lib/emailAutomation';
import { requireAdminRoute } from '@/lib/rbac';

export async function GET() {
  const auth = await requireAdminRoute({ action: 'read', resource: 'email' });
  if (auth.response) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('email_broadcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'email' });
  if (auth.response || !auth.admin) return auth.response;

  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.subject_template || !body.html_template || !body.text_template) {
    return NextResponse.json({ error: 'name, subject_template, html_template, and text_template are required' }, { status: 400 });
  }

  const broadcast = await createBroadcastAndQueue({
    name: String(body.name),
    segmentKey: typeof body.segment_key === 'string' ? body.segment_key : 'subscribers',
    couponCode: typeof body.coupon_code === 'string' ? body.coupon_code : null,
    subjectTemplate: String(body.subject_template),
    htmlTemplate: String(body.html_template),
    textTemplate: String(body.text_template),
    createdBy: auth.admin.user.id,
  });

  return NextResponse.json({ ok: true, broadcast }, { status: 201 });
}

