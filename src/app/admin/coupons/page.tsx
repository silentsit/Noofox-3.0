'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Coupon } from '@/types/database';
import { formatMoney } from '@/lib/orders';

type FormState = {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_order_amount: string;
  max_discount_amount: string;
  usage_limit: string;
  usage_limit_per_user: string;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
};

const EMPTY_FORM: FormState = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_amount: '',
  max_discount_amount: '',
  usage_limit: '',
  usage_limit_per_user: '',
  is_active: true,
  starts_at: '',
  expires_at: '',
};

function toLocal(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/coupons');
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
  }

  function openEdit(c: Coupon) {
    setEditingId(c.id);
    setForm({
      code: c.code,
      description: c.description ?? '',
      discount_type: c.discount_type as 'percentage' | 'fixed',
      discount_value: String(c.discount_value),
      min_order_amount: c.min_order_amount ? String(c.min_order_amount) : '',
      max_discount_amount: c.max_discount_amount ? String(c.max_discount_amount) : '',
      usage_limit: c.usage_limit ? String(c.usage_limit) : '',
      usage_limit_per_user: c.usage_limit_per_user ? String(c.usage_limit_per_user) : '',
      is_active: c.is_active,
      starts_at: toLocal(c.starts_at),
      expires_at: toLocal(c.expires_at),
    });
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const url = editingId ? `/api/admin/coupons/${editingId}` : '/api/admin/coupons';
    const method = editingId ? 'PATCH' : 'POST';

    const payload = {
      ...form,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    setShowForm(false);
    setEditingId(null);
    loadCoupons();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon permanently?')) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    if (res.ok) loadCoupons();
  }

  async function handleToggle(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    loadCoupons();
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Coupons</h1>
          <p className="mt-1 text-surface-500">
            Manage discount codes, usage limits, and promotional campaigns.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + New coupon
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-semibold text-surface-900">
            {editingId ? 'Edit coupon' : 'Create coupon'}
          </h2>
          {error && (
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-surface-700">Code</span>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                placeholder="SUMMER20"
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-surface-700">Description</span>
              <input
                type="text"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Summer sale 20% off"
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-surface-700">Type</span>
              <select
                value={form.discount_type}
                onChange={(e) => updateField('discount_type', e.target.value as 'percentage' | 'fixed')}
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-surface-700">
                Value {form.discount_type === 'percentage' ? '(%)' : '($)'}
              </span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.discount_value}
                onChange={(e) => updateField('discount_value', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-surface-700">Min order ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.min_order_amount}
                onChange={(e) => updateField('min_order_amount', e.target.value)}
                placeholder="0"
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-surface-700">Max discount ($)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.max_discount_amount}
                onChange={(e) => updateField('max_discount_amount', e.target.value)}
                placeholder="No cap"
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-surface-700">Total usage limit</span>
              <input
                type="number"
                min="1"
                value={form.usage_limit}
                onChange={(e) => updateField('usage_limit', e.target.value)}
                placeholder="Unlimited"
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-surface-700">Per-user limit</span>
              <input
                type="number"
                min="1"
                value={form.usage_limit_per_user}
                onChange={(e) => updateField('usage_limit_per_user', e.target.value)}
                placeholder="Unlimited"
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-surface-700">Starts at</span>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => updateField('starts_at', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-surface-700">Expires at</span>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => updateField('expires_at', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-surface-700">Active</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-surface-300 px-5 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200">
            <thead className="bg-surface-50">
              <tr className="text-left text-xs uppercase tracking-[0.16em] text-surface-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min order</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-surface-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-surface-500">
                    No coupons yet. Create your first coupon above.
                  </td>
                </tr>
              )}
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-surface-50">
                  <td className="px-4 py-4 font-mono text-sm font-medium text-surface-900">
                    {c.code}
                    {c.description && (
                      <span className="ml-2 font-sans text-xs text-surface-400">{c.description}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-700">
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : formatMoney(c.discount_value)}
                    {c.max_discount_amount != null && (
                      <span className="ml-1 text-xs text-surface-400">
                        (max {formatMoney(c.max_discount_amount)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-600">
                    {c.min_order_amount > 0 ? formatMoney(c.min_order_amount) : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-600">
                    {c.times_used}{c.usage_limit != null ? ` / ${c.usage_limit}` : ''}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-surface-100 text-surface-500'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-600">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => openEdit(c)}
                      className="mr-2 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
