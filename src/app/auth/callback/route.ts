import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { id, email } = data.user;
      const normalizedEmail = (email ?? '').trim().toLowerCase();
      if (normalizedEmail) {
        await supabase.rpc('reconcile_guest_orders', {
          p_user_id: id,
          p_email: normalizedEmail,
        });
      }
      return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : `/${next}`}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
