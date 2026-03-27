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

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const ip = clientIpFromRequest(request) ?? 'unknown';
  const emailKey = email.toLowerCase();
  const rate = await consumeRateLimit('auth_sign_in', `${ip}:${emailKey}`, 8, 300);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const humanOk = await verifyTurnstileToken(turnstileToken, ip);
  if (!humanOk) {
    return NextResponse.json({ error: 'Human verification failed. Refresh and try again.' }, { status: 403 });
  }

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

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
