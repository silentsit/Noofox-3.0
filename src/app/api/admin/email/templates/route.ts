import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/rbac';

export async function GET() {
  const auth = await requireAdminRoute({ action: 'read', resource: 'email' });
  if (auth.response) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('is_system', { ascending: false })
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'email' });
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const key = typeof body.key === 'string' ? body.key.trim() : '';
  if (!key || !body.name || !body.subject_template || !body.html_template || !body.text_template) {
    return NextResponse.json({ error: 'key, name, subject_template, html_template, and text_template are required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('email_templates')
    .insert({
      key,
      name: String(body.name),
      description: body.description ? String(body.description) : null,
      audience: body.audience === 'admin' || body.audience === 'marketing' || body.audience === 'internal' ? body.audience : 'customer',
      subject_template: String(body.subject_template),
      html_template: String(body.html_template),
      text_template: String(body.text_template),
      is_system: false,
      is_active: body.is_active !== false,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

