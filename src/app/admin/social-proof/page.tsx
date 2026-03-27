'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SocialProofCampaign } from '@/types/database';

type Campaign = SocialProofCampaign;

export default function AdminSocialProofPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [draft, setDraft] = useState<Partial<Campaign>>({
    name: 'Live notifications',
    is_active: false,
    display_mode: 'mixed',
    message_template: '{{city}} · {{product}}',
    delay_ms: 6000,
    min_interval_ms: 15000,
    max_interval_ms: 40000,
    page_include: [],
    page_exclude: ['/admin', '/checkout'],
    evergreen_pool: [
      { city: 'New York', product: 'Modalert', url: '/shop' },
      { city: 'Miami', product: 'Armodafinil', url: '/shop' },
    ],
  });
  const [includeStr, setIncludeStr] = useState('');
  const [excludeStr, setExcludeStr] = useState('/admin,/checkout');
  const [poolJson, setPoolJson] = useState(
    '[\n  {"city":"New York","product":"Modalert","url":"/shop"}\n]'
  );

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/social-proof/campaigns');
    const data = await res.json().catch(() => []);
    if (res.ok) setCampaigns(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    let evergreen_pool: unknown = [];
    try {
      evergreen_pool = JSON.parse(poolJson || '[]');
    } catch {
      setMessage('Evergreen pool must be valid JSON array.');
      return;
    }
    const page_include = includeStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const page_exclude = excludeStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch('/api/admin/social-proof/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draft,
        page_include,
        page_exclude,
        evergreen_pool,
      }),
    });
    const err = await res.json().catch(() => ({}));
    setMessage(res.ok ? 'Campaign created.' : (err.error as string) || 'Failed');
    if (res.ok) void load();
  }

  async function toggleActive(c: Campaign) {
    const res = await fetch(`/api/admin/social-proof/campaigns/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    if (res.ok) void load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Social proof</h1>
        <p className="mt-1 text-surface-500">
          Slide-in notifications (SSE). Activate one campaign; tune intervals and evergreen JSON pool.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-700">
          {message}
        </div>
      )}

      <form onSubmit={createCampaign} className="space-y-4 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-surface-900">New campaign</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-surface-700">Name</span>
            <input
              className="w-full rounded-lg border border-surface-300 px-3 py-2"
              value={draft.name ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-surface-700">Mode</span>
            <select
              className="w-full rounded-lg border border-surface-300 px-3 py-2"
              value={draft.display_mode ?? 'mixed'}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  display_mode: e.target.value as Campaign['display_mode'],
                }))
              }
            >
              <option value="mixed">Mixed (live + evergreen)</option>
              <option value="live">Live orders only</option>
              <option value="evergreen">Evergreen only</option>
            </select>
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-surface-700">Message template</span>
          <input
            className="w-full rounded-lg border border-surface-300 px-3 py-2 font-mono text-xs"
            value={draft.message_template ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, message_template: e.target.value }))}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-surface-700">Toast duration (ms)</span>
            <input
              type="number"
              className="w-full rounded-lg border border-surface-300 px-3 py-2"
              value={draft.delay_ms ?? 6000}
              onChange={(e) => setDraft((d) => ({ ...d, delay_ms: Number(e.target.value) }))}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-surface-700">Min interval (ms)</span>
            <input
              type="number"
              className="w-full rounded-lg border border-surface-300 px-3 py-2"
              value={draft.min_interval_ms ?? 15000}
              onChange={(e) => setDraft((d) => ({ ...d, min_interval_ms: Number(e.target.value) }))}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-surface-700">Max interval (ms)</span>
            <input
              type="number"
              className="w-full rounded-lg border border-surface-300 px-3 py-2"
              value={draft.max_interval_ms ?? 40000}
              onChange={(e) => setDraft((d) => ({ ...d, max_interval_ms: Number(e.target.value) }))}
            />
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-surface-700">Page include (comma paths, empty = all)</span>
          <input
            className="w-full rounded-lg border border-surface-300 px-3 py-2"
            value={includeStr}
            onChange={(e) => setIncludeStr(e.target.value)}
            placeholder="/shop,/product"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-surface-700">Page exclude (comma paths)</span>
          <input
            className="w-full rounded-lg border border-surface-300 px-3 py-2"
            value={excludeStr}
            onChange={(e) => setExcludeStr(e.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-surface-700">Evergreen JSON pool</span>
          <textarea
            className="min-h-32 w-full rounded-lg border border-surface-300 px-3 py-2 font-mono text-xs"
            value={poolJson}
            onChange={(e) => setPoolJson(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-surface-900 px-4 py-2 text-sm font-medium text-white hover:bg-surface-800"
        >
          Create campaign
        </button>
      </form>

      <div className="rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="border-b border-surface-200 px-4 py-3">
          <h2 className="text-lg font-medium text-surface-900">Campaigns</h2>
        </div>
        {loading ? (
          <p className="p-4 text-surface-500">Loading…</p>
        ) : campaigns.length === 0 ? (
          <p className="p-4 text-surface-500">No campaigns yet. Create one and set active (only one should be active).</p>
        ) : (
          <ul className="divide-y divide-surface-200">
            {campaigns.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-surface-900">{c.name}</p>
                  <p className="text-xs text-surface-500">
                    {c.display_mode} · {c.is_active ? 'active' : 'inactive'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleActive(c)}
                  className="rounded-lg border border-surface-300 px-3 py-1.5 text-sm hover:bg-surface-50"
                >
                  {c.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
