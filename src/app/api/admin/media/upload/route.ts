import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/audit';
import { requireAdminRoute } from '@/lib/rbac';

const BUCKET = 'media';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: Request) {
  const auth = await requireAdminRoute({ action: 'write', resource: 'media' });
  if (auth.response) return auth.response;

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing or invalid file' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid type. Use JPEG, PNG, GIF, or WebP.' }, { status: 400 });
  }

  const supabase = await createClient();
  const ext = file.name.replace(/^.*\./, '') || 'jpg';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const now = new Date();
  const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = urlData.publicUrl;

  const { data: row, error: insertError } = await supabase
    .from('media')
    .insert({
      file_path: path,
      url,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  await writeAuditLog({
    action: 'upload',
    resourceType: 'media',
    resourceId: row.id,
    newData: {
      file_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    },
  });

  return NextResponse.json(row);
}
