import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/rbac';

export async function GET() {
  const auth = await requireAdminRoute({ action: 'read', resource: 'social_proof' });
  if (auth.response) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('social_proof_campaigns')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'social_proof' });
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('social_proof_campaigns')
    .insert({
      name,
      is_active: body.is_active === true,
      display_mode:
        body.display_mode === 'live' || body.display_mode === 'evergreen' ? body.display_mode : 'mixed',
      message_template:
        typeof body.message_template === 'string' ? body.message_template : '{{city}} · {{product}}',
      link_url: typeof body.link_url === 'string' ? body.link_url : null,
      delay_ms: Number(body.delay_ms) >= 0 ? Number(body.delay_ms) : 4000,
      min_interval_ms: Number(body.min_interval_ms) >= 1000 ? Number(body.min_interval_ms) : 15000,
      max_interval_ms: Number(body.max_interval_ms) >= 1000 ? Number(body.max_interval_ms) : 40000,
      page_include: Array.isArray(body.page_include) ? body.page_include : [],
      page_exclude: Array.isArray(body.page_exclude) ? body.page_exclude : [],
      evergreen_pool: body.evergreen_pool ?? [],
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
