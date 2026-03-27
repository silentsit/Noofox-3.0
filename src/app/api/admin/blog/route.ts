import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/audit';
import { requireAdminRoute } from '@/lib/rbac';

export async function POST(request: Request) {
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

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      content: content || '',
      author_id: auth.admin.user.id,
      published,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'create',
    resourceType: 'blog_post',
    resourceId: data.id,
    newData: { title, slug, published },
  });

  return NextResponse.json({ id: data.id });
}
