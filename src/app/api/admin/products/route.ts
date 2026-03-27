import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/audit';
import { requireAdminRoute } from '@/lib/rbac';

export async function POST(request: Request) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'products' });
  if (auth.response) return auth.response;

  const body = await request.json();
  const { name, price, description, images, image_meta, stock_count } = body;
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
      image_meta: image_meta && typeof image_meta === 'object' ? image_meta : {},
      stock_count: parseInt(String(stock_count), 10) || 0,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAuditLog({
    action: 'create',
    resourceType: 'product',
    resourceId: data.id,
    newData: {
      name: String(name),
      price: parseFloat(price) || 0,
      description: description ? String(description) : null,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      image_meta: image_meta && typeof image_meta === 'object' ? image_meta : {},
      stock_count: parseInt(String(stock_count), 10) || 0,
    },
  });

  return NextResponse.json(data);
}
