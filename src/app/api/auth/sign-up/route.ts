import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { clientIpFromRequest, verifyTurnstileToken } from '@/lib/turnstile';
import { consumeRateLimit } from '@/lib/rateLimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const turnstileToken = typeof body.turnstile_token === 'string' ? body.turnstile_token : '';
  const redirectTo =
    typeof body.redirect_to === 'string' && body.redirect_to.startsWith('/')
      ? body.redirect_to
      : '/dashboard';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const ip = clientIpFromRequest(request) ?? 'unknown';
  const emailKey = email.toLowerCase();
  const rate = await consumeRateLimit('auth_sign_up', `${ip}:${emailKey}`, 5, 300);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many sign-up attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const humanOk = await verifyTurnstileToken(turnstileToken, ip);
  if (!humanOk) {
    return NextResponse.json({ error: 'Human verification failed. Refresh and try again.' }, { status: 403 });
  }

  const origin = new URL(request.url).origin;
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // ignore
        }
      },
    },
  });

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
