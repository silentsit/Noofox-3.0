import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdminRoute } from '@/lib/rbac';

export async function GET() {
  const auth = await requireAdminRoute({ action: 'read', resource: 'email' });
  if (auth.response) return auth.response;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('email_queue')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

