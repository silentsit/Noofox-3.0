'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Address } from '@/types/database';

export default function DashboardProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [profile, setProfile] = useState<{
    full_name?: string;
    shipping_address?: Address | null;
  }>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: row } = await supabase
        .from('users')
        .select('profile_data')
        .eq('id', user.id)
        .single();
      const pd = (row?.profile_data as Record<string, unknown> | null) ?? {};
      setProfile({
        full_name: (pd.full_name as string) ?? '',
        shipping_address: (pd.shipping_address as Address | null) ?? null,
      });
      setLoading(false);
    })();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage({ type: 'error', text: 'Not signed in.' });
      setSaving(false);
      return;
    }
    const { data: existing } = await supabase
      .from('users')
      .select('profile_data')
      .eq('id', user.id)
      .single();
    const existingData = (existing?.profile_data as Record<string, unknown>) ?? {};
    const { error } = await supabase
      .from('users')
      .update({
        profile_data: {
          ...existingData,
          full_name: profile.full_name,
          shipping_address: profile.shipping_address ?? null,
        },
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    setMessage({ type: 'success', text: 'Profile updated.' });
  }

  const addr = profile.shipping_address;

  if (loading) {
    return (
      <div className="text-surface-500">Loading…</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-surface-900">Profile & shipping</h1>
      <p className="mt-1 text-surface-500">
        Update your name and default shipping address.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">
        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-surface-700">
            Full name
          </label>
          <input
            id="full_name"
            type="text"
            value={profile.full_name ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <fieldset className="rounded-xl border border-surface-200 p-4">
          <legend className="text-sm font-medium text-surface-900">Shipping address</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="line1" className="block text-sm text-surface-500">Address line 1</label>
              <input
                id="line1"
                type="text"
                value={addr?.line1 ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    shipping_address: {
                      ...(p.shipping_address ?? {}),
                      line1: e.target.value,
                      line2: p.shipping_address?.line2,
                      city: p.shipping_address?.city ?? '',
                      state: p.shipping_address?.state,
                      postal_code: p.shipping_address?.postal_code ?? '',
                      country: p.shipping_address?.country ?? '',
                    } as Address,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="line2" className="block text-sm text-surface-500">Address line 2</label>
              <input
                id="line2"
                type="text"
                value={addr?.line2 ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    shipping_address: {
                      ...(p.shipping_address ?? {}),
                      line1: p.shipping_address?.line1 ?? '',
                      line2: e.target.value || undefined,
                      city: p.shipping_address?.city ?? '',
                      state: p.shipping_address?.state,
                      postal_code: p.shipping_address?.postal_code ?? '',
                      country: p.shipping_address?.country ?? '',
                    } as Address,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm text-surface-500">City</label>
              <input
                id="city"
                type="text"
                value={addr?.city ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    shipping_address: {
                      ...(p.shipping_address ?? {}),
                      line1: p.shipping_address?.line1 ?? '',
                      line2: p.shipping_address?.line2,
                      city: e.target.value,
                      state: p.shipping_address?.state,
                      postal_code: p.shipping_address?.postal_code ?? '',
                      country: p.shipping_address?.country ?? '',
                    } as Address,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="postal_code" className="block text-sm text-surface-500">Postal code</label>
              <input
                id="postal_code"
                type="text"
                value={addr?.postal_code ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    shipping_address: {
                      ...(p.shipping_address ?? {}),
                      line1: p.shipping_address?.line1 ?? '',
                      line2: p.shipping_address?.line2,
                      city: p.shipping_address?.city ?? '',
                      state: p.shipping_address?.state,
                      postal_code: e.target.value,
                      country: p.shipping_address?.country ?? '',
                    } as Address,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="country" className="block text-sm text-surface-500">Country</label>
              <input
                id="country"
                type="text"
                value={addr?.country ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    shipping_address: {
                      ...(p.shipping_address ?? {}),
                      line1: p.shipping_address?.line1 ?? '',
                      line2: p.shipping_address?.line2,
                      city: p.shipping_address?.city ?? '',
                      state: p.shipping_address?.state,
                      postal_code: p.shipping_address?.postal_code ?? '',
                      country: e.target.value,
                    } as Address,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2"
              />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-surface-900 hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
