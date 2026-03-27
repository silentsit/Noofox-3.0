import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/audit';
import { requireAdminRoute } from '@/lib/rbac';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdminRoute({ action: 'write', resource: 'blog' });
  if (auth.response) return auth.response;

  const supabase = await createClient();

  const body = await request.json().catch(() => ({}));
  const title = (body.title as string)?.trim();
  const slug = (body.slug as string)?.trim().replace(/^\/+|\/+$/g, '').replace(/\//g, '-');
  const content = typeof body.content === 'string' ? body.content : '';
  const published = Boolean(body.published);

  if (!title || !slug) {
    return NextResponse.json({ error: 'title and slug required' }, { status: 400 });
  }

  const { data: previous } = await supabase.from('blog_posts').select('*').eq('id', id).single();

  const { error } = await supabase
    .from('blog_posts')
    .update({ title, slug, content, published, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'update',
    resourceType: 'blog_post',
    resourceId: id,
    oldData: previous,
    newData: { title, slug, published },
  });

  return NextResponse.json({ ok: true });
}
