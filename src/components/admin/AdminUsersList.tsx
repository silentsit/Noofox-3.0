'use client';

import { useState } from 'react';

type UserRow = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export function AdminUsersList({ users }: { users: UserRow[] }) {
  const [sending, setSending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleSendReset(email: string) {
    setSending(email);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/users/send-reset-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'err', text: (data.error as string) || 'Failed to send reset link' });
        return;
      }
      setMessage({ type: 'ok', text: `Reset link sent to ${email}` });
    } finally {
      setSending(null);
    }
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Remove user ${email}? This cannot be undone.`)) return;
    setDeleting(userId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'err', text: (data.error as string) || 'Failed to delete user' });
        return;
      }
      setMessage({ type: 'ok', text: 'User removed' });
      window.location.reload();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mt-8">
      {message && (
        <div
          className={`mb-4 rounded-lg border p-3 text-sm ${
            message.type === 'ok' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-surface-200">
          <thead className="bg-surface-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500 sm:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-surface-900 sm:px-6">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-surface-600 sm:px-6">
                  {user.role}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-surface-500 sm:px-6">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm sm:px-6">
                  <button
                    type="button"
                    onClick={() => handleSendReset(user.email)}
                    disabled={sending !== null}
                    className="font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
                  >
                    {sending === user.email ? 'Sending…' : 'Send reset link'}
                  </button>
                  {' · '}
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={deleting !== null || user.role === 'admin'}
                    className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting === user.id ? 'Removing…' : 'Remove'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-surface-500">No users yet.</div>
        )}
      </div>
    </div>
  );
}
