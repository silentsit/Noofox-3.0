'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EmailAutomation, EmailBroadcast, EmailQueueJob, EmailTemplate } from '@/types/database';

const SEGMENTS = [
  { key: 'subscribers', label: 'Subscribers' },
  { key: 'customers', label: 'Customers' },
  { key: 'admins', label: 'Admins' },
] as const;

type BroadcastForm = {
  name: string;
  segment_key: string;
  coupon_code: string;
  subject_template: string;
  html_template: string;
  text_template: string;
};

const EMPTY_BROADCAST: BroadcastForm = {
  name: '',
  segment_key: 'subscribers',
  coupon_code: '',
  subject_template: '',
  html_template: '<p>Hello {{customer_email}},</p><p></p>',
  text_template: '',
};

export function AdminEmailConsole() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [queue, setQueue] = useState<EmailQueueJob[]>([]);
  const [broadcasts, setBroadcasts] = useState<EmailBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [broadcast, setBroadcast] = useState<BroadcastForm>(EMPTY_BROADCAST);

  const load = useCallback(async () => {
    setLoading(true);
    const [templatesRes, automationsRes, queueRes, broadcastsRes] = await Promise.all([
      fetch('/api/admin/email/templates'),
      fetch('/api/admin/email/automations'),
      fetch('/api/admin/email/queue'),
      fetch('/api/admin/email/broadcasts'),
    ]);

    if (templatesRes.ok) setTemplates(await templatesRes.json());
    if (automationsRes.ok) setAutomations(await automationsRes.json());
    if (queueRes.ok) setQueue(await queueRes.json());
    if (broadcastsRes.ok) setBroadcasts(await broadcastsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const templateOptions = useMemo(
    () => templates.map((template) => ({ key: template.key, name: template.name })),
    [templates]
  );

  async function saveTemplate(template: EmailTemplate) {
    const res = await fetch(`/api/admin/email/templates/${template.key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? `Saved template: ${template.name}` : (data.error as string) || 'Failed to save template');
    if (res.ok) void load();
  }

  async function saveAutomation(automation: EmailAutomation) {
    const res = await fetch('/api/admin/email/automations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(automation),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? `Updated automation: ${automation.name}` : (data.error as string) || 'Failed to update automation');
    if (res.ok) void load();
  }

  async function dispatchQueue() {
    const res = await fetch('/api/admin/email/dispatch', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    setMessage(
      res.ok
        ? `Dispatched queue. Sent: ${data.dispatched?.sent ?? 0}, failed: ${data.dispatched?.failed ?? 0}, abandoned-cart queued: ${data.queued?.queued ?? 0}`
        : (data.error as string) || 'Dispatch failed'
    );
    if (res.ok) void load();
  }

  async function queueBroadcast(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/email/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(broadcast),
    });
    const data = await res.json().catch(() => ({}));
    setMessage(res.ok ? 'Broadcast queued successfully.' : (data.error as string) || 'Broadcast failed');
    if (res.ok) {
      setBroadcast(EMPTY_BROADCAST);
      void load();
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Email automation</h1>
          <p className="mt-1 text-surface-500">
            Manage transactional templates, marketing broadcasts, automations, and the send queue.
          </p>
        </div>
        <button
          type="button"
          onClick={dispatchQueue}
          className="rounded-xl bg-surface-900 px-4 py-2 text-sm font-medium text-white hover:bg-surface-800"
        >
          Process queue now
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-700">
          {message}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Broadcast</h2>
          <p className="mt-1 text-surface-500">Queue a one-off email to a segment, with optional coupon code tokens.</p>
        </div>
        <form onSubmit={queueBroadcast} className="grid gap-4 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-surface-700">Name</span>
            <input className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm" value={broadcast.name} onChange={(e) => setBroadcast((prev) => ({ ...prev, name: e.target.value }))} required />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-surface-700">Segment</span>
            <select className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm" value={broadcast.segment_key} onChange={(e) => setBroadcast((prev) => ({ ...prev, segment_key: e.target.value }))}>
              {SEGMENTS.map((segment) => (
                <option key={segment.key} value={segment.key}>{segment.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-medium text-surface-700">Subject</span>
            <input className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm" value={broadcast.subject_template} onChange={(e) => setBroadcast((prev) => ({ ...prev, subject_template: e.target.value }))} required />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-surface-700">Coupon code</span>
            <input className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm" value={broadcast.coupon_code} onChange={(e) => setBroadcast((prev) => ({ ...prev, coupon_code: e.target.value }))} />
          </label>
          <div className="text-xs text-surface-500 sm:pt-7">Use tokens like <code>{'{{customer_email}}'}</code>, <code>{'{{coupon_code}}'}</code>, and <code>{'{{site_url}}'}</code>.</div>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-medium text-surface-700">HTML body</span>
            <textarea className="min-h-40 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm" value={broadcast.html_template} onChange={(e) => setBroadcast((prev) => ({ ...prev, html_template: e.target.value }))} required />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm font-medium text-surface-700">Text body</span>
            <textarea className="min-h-28 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm" value={broadcast.text_template} onChange={(e) => setBroadcast((prev) => ({ ...prev, text_template: e.target.value }))} required />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Queue broadcast</button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Automations</h2>
          <p className="mt-1 text-surface-500">Enable/disable flows and adjust delivery delays in minutes.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-surface-200 text-sm">
            <thead className="bg-surface-50 text-left text-xs uppercase tracking-[0.14em] text-surface-500">
              <tr>
                <th className="px-4 py-3">Automation</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Delay</th>
                <th className="px-4 py-3">Enabled</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {automations.map((automation) => (
                <AutomationRow key={automation.key} automation={automation} templateOptions={templateOptions} onSave={saveAutomation} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Templates</h2>
          <p className="mt-1 text-surface-500">Edit the subject, HTML, and plain text used for each event.</p>
        </div>
        <div className="space-y-4">
          {templates.map((template) => (
            <TemplateCard key={template.key} template={template} onSave={saveTemplate} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Queue</h2>
          <p className="mt-1 text-surface-500">Recent sends, retries, and failed jobs.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-surface-200 text-sm">
            <thead className="bg-surface-50 text-left text-xs uppercase tracking-[0.14em] text-surface-500">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Send after</th>
                <th className="px-4 py-3">Attempts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-surface-500">Loading…</td></tr>
              ) : queue.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-surface-500">No jobs yet.</td></tr>
              ) : queue.slice(0, 40).map((job) => (
                <tr key={job.id}>
                  <td className="px-4 py-3">{job.status}</td>
                  <td className="px-4 py-3">{job.event_key}</td>
                  <td className="px-4 py-3">{job.recipient_email}</td>
                  <td className="px-4 py-3">{new Date(job.send_after).toLocaleString()}</td>
                  <td className="px-4 py-3">{job.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-surface-900">Recent broadcasts</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-surface-200 text-sm">
            <thead className="bg-surface-50 text-left text-xs uppercase tracking-[0.14em] text-surface-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {broadcasts.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-surface-500">No broadcasts yet.</td></tr>
              ) : broadcasts.map((broadcast) => (
                <tr key={broadcast.id}>
                  <td className="px-4 py-3">{broadcast.name}</td>
                  <td className="px-4 py-3">{broadcast.segment_key}</td>
                  <td className="px-4 py-3">{broadcast.status}</td>
                  <td className="px-4 py-3">{new Date(broadcast.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TemplateCard({ template, onSave }: { template: EmailTemplate; onSave: (template: EmailTemplate) => void }) {
  const [draft, setDraft] = useState(template);

  useEffect(() => {
    setDraft(template);
  }, [template]);

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-surface-900">{template.name}</h3>
          <p className="mt-1 text-sm text-surface-500">{template.key}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-surface-700">
          <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft((prev) => ({ ...prev, is_active: e.target.checked }))} />
          Active
        </label>
      </div>
      <div className="mt-4 grid gap-4">
        <input className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm" value={draft.subject_template} onChange={(e) => setDraft((prev) => ({ ...prev, subject_template: e.target.value }))} />
        <textarea className="min-h-28 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm" value={draft.html_template} onChange={(e) => setDraft((prev) => ({ ...prev, html_template: e.target.value }))} />
        <textarea className="min-h-24 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm" value={draft.text_template} onChange={(e) => setDraft((prev) => ({ ...prev, text_template: e.target.value }))} />
        <div>
          <button type="button" onClick={() => onSave(draft)} className="rounded-xl bg-surface-900 px-4 py-2 text-sm font-medium text-white hover:bg-surface-800">Save template</button>
        </div>
      </div>
    </div>
  );
}

function AutomationRow({
  automation,
  templateOptions,
  onSave,
}: {
  automation: EmailAutomation;
  templateOptions: Array<{ key: string; name: string }>;
  onSave: (automation: EmailAutomation) => void;
}) {
  const [draft, setDraft] = useState(automation);

  useEffect(() => {
    setDraft(automation);
  }, [automation]);

  return (
    <tr>
      <td className="px-4 py-3">{automation.name}</td>
      <td className="px-4 py-3">
        <select className="rounded-lg border border-surface-300 px-2 py-1 text-sm" value={draft.template_key} onChange={(e) => setDraft((prev) => ({ ...prev, template_key: e.target.value }))}>
          {templateOptions.map((option) => (
            <option key={option.key} value={option.key}>{option.name}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input type="number" min={0} className="w-24 rounded-lg border border-surface-300 px-2 py-1 text-sm" value={draft.delay_minutes} onChange={(e) => setDraft((prev) => ({ ...prev, delay_minutes: Number(e.target.value) || 0 }))} />
      </td>
      <td className="px-4 py-3">
        <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft((prev) => ({ ...prev, enabled: e.target.checked }))} />
      </td>
      <td className="px-4 py-3">
        <button type="button" onClick={() => onSave(draft)} className="rounded-lg border border-surface-300 px-3 py-1.5 text-sm font-medium text-surface-700 hover:bg-surface-50">Save</button>
      </td>
    </tr>
  );
}

