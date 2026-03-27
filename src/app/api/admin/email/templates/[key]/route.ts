import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/rbac';

export async function PATCH(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'email' });
  if (auth.response) return auth.response;

  const { key } = await params;
  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = String(body.name);
  if (body.description !== undefined) updates.description = body.description ? String(body.description) : null;
  if (body.audience !== undefined) updates.audience = body.audience;
  if (body.subject_template !== undefined) updates.subject_template = String(body.subject_template);
  if (body.html_template !== undefined) updates.html_template = String(body.html_template);
  if (body.text_template !== undefined) updates.text_template = String(body.text_template);
  if (body.is_active !== undefined) updates.is_active = !!body.is_active;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('key', key)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

