import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
      author_id: user.id,
      published,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Slug already in use' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ id: data.id });
}
