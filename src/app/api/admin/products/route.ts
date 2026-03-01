import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}

export async function POST(request: Request) {
  const authErr = await ensureAdmin();
  if (authErr) return authErr;

  const body = await request.json();
  const { name, price, description, images, stock_count } = body;
  if (!name || price == null) {
    return NextResponse.json({ error: 'name and price required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: String(name),
      price: parseFloat(price) || 0,
      description: description ? String(description) : null,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      stock_count: parseInt(String(stock_count), 10) || 0,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
