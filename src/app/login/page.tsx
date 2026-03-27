'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TurnstileField } from '@/components/security/TurnstileField';

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    if (turnstileRequired && !turnstileToken) {
      setLoading(false);
      setMessage({ type: 'error', text: 'Please complete the verification challenge.' });
      return;
    }
    const res = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        turnstile_token: turnstileToken ?? '',
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMessage({ type: 'error', text: (data as { error?: string }).error ?? 'Sign in failed' });
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
      return;
    }
  }

  return (
    <div className="min-w-0 bg-background py-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-md justify-center px-4">
        <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use email or Google to continue.
        </p>

        {message && (
          <div
            className={`mt-4 rounded-lg p-3 text-sm ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <TurnstileField className="flex justify-center" onToken={setTurnstileToken} />
          <button
            type="submit"
            disabled={loading || (turnstileRequired && !turnstileToken)}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in with Email'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2.5 font-medium text-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-w-0 bg-background py-12 text-center text-muted-foreground">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
