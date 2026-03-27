import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  addOrderNoteAction,
  updateOrderAddressesAction,
  updateOrderGeneralAction,
  updateOrderStatusAction,
  updateTrackingAction,
} from '@/app/admin/orders/actions';
import {
  formatAddressSnippet,
  formatMoney,
  getOrderStatusClasses,
  ORDER_STATUS_TABS,
  toDisplayItems,
} from '@/lib/orders';
import { requireAdminPage } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';
import type { Order, OrderTimelineEntry } from '@/types/database';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

function inputClassName() {
  return 'mt-1 w-full rounded-xl border border-surface-300 px-3 py-2 text-sm text-surface-900';
}

function textareaClassName() {
  return 'mt-1 min-h-[120px] w-full rounded-xl border border-surface-300 px-3 py-2 text-sm text-surface-900';
}

function getAddressValue(address: unknown, key: string) {
  if (!address || typeof address !== 'object') {
    return '';
  }

  const candidate = address as Record<string, unknown>;
  const value = candidate[key];
  return typeof value === 'string' ? value : '';
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  await requireAdminPage({ action: 'read', resource: 'orders' });

  const { id } = await params;
  const supabase = await createClient();
  const { data: orderRow } = await supabase.from('orders').select('*').eq('id', id).single();
  const { data: timelineRows } = await supabase
    .from('order_timeline')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: false });

  const order = orderRow as Order | null;
  if (!order) {
    notFound();
  }

  const timeline = (timelineRows ?? []) as OrderTimelineEntry[];
  const items = toDisplayItems(order.items) as Array<Record<string, unknown>>;
  const legacyNotes = Array.isArray(order.internal_notes) ? order.internal_notes : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/admin/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Back to orders
            </Link>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getOrderStatusClasses(order.status)}`}>
              {order.status}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-surface-900">Order {order.id}</h1>
          <p className="mt-1 text-surface-500">
            Customer {order.customer_email ?? 'Guest checkout'} · {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total" value={formatMoney(order.total_amount)} />
          <SummaryCard label="Payment" value={order.payment_method ?? 'Unspecified'} />
          <SummaryCard label="Tracking" value={order.tracking_id ?? 'Pending'} mono />
          <SummaryCard label="Attribution" value={order.attribution_source ?? 'Direct'} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-surface-200 bg-white shadow-sm">
            <div className="border-b border-surface-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-surface-900">Line items</h2>
              <p className="text-sm text-surface-500">SKU, variation, quantity, and pricing snapshot.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200">
                <thead className="bg-surface-50 text-left text-xs uppercase tracking-[0.16em] text-surface-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Variation</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {items.map((item, index) => {
                    const quantity = Number(item.quantity ?? 0);
                    const price = Number(item.price ?? 0);
                    return (
                      <tr key={`${String(item.product_id ?? index)}-${index}`}>
                        <td className="px-4 py-4">
                          <div className="font-medium text-surface-900">{String(item.name ?? 'Unnamed item')}</div>
                          <div className="mt-1 text-xs text-surface-500">{String(item.product_id ?? 'No product id')}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-surface-600">{String(item.sku ?? '—')}</td>
                        <td className="px-4 py-4 text-sm text-surface-600">{String(item.variation_id ?? '—')}</td>
                        <td className="px-4 py-4 text-sm text-surface-900">{quantity}</td>
                        <td className="px-4 py-4 text-sm text-surface-600">{formatMoney(price)}</td>
                        <td className="px-4 py-4 text-sm font-medium text-surface-900">{formatMoney(price * quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {items.length === 0 && (
              <div className="px-6 py-10 text-center text-surface-500">No line items captured on this order.</div>
            )}
          </section>

          <section className="rounded-2xl border border-surface-200 bg-white shadow-sm">
            <div className="border-b border-surface-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-surface-900">Timeline ledger</h2>
              <p className="text-sm text-surface-500">Automated system events and private admin notes.</p>
            </div>
            <div className="space-y-4 px-6 py-5">
              {timeline.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-surface-900">
                      {entry.entry_type === 'note' ? 'Admin note' : 'System event'}
                    </div>
                    <div className="text-xs text-surface-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-surface-700">{entry.message}</p>
                  {entry.is_private && (
                    <div className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-amber-700">
                      Private
                    </div>
                  )}
                </div>
              ))}
              {timeline.length === 0 && (
                <div className="rounded-2xl border border-dashed border-surface-300 px-4 py-8 text-center text-sm text-surface-500">
                  No timeline entries yet. Status changes, tracking saves, and notes will appear here.
                </div>
              )}
              {legacyNotes.length > 0 && (
                <div className="rounded-2xl border border-surface-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-surface-900">Legacy notes</h3>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-surface-950/95 p-4 text-xs text-surface-100">
                    {JSON.stringify(legacyNotes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <form action={addOrderNoteAction} className="border-t border-surface-200 px-6 py-5">
              <input type="hidden" name="order_id" value={order.id} />
              <input type="hidden" name="is_private" value="true" />
              <label className="text-sm font-medium text-surface-900">
                Add private note
                <textarea
                  name="message"
                  placeholder="Capture support context, customer sentiment, or fulfillment instructions."
                  className={textareaClassName()}
                />
              </label>
              <div className="mt-3">
                <button
                  type="submit"
                  className="rounded-xl bg-surface-900 px-4 py-2 text-sm font-medium text-white hover:bg-surface-800"
                >
                  Save note
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900">Fulfillment tools</h2>
            <p className="mt-1 text-sm text-surface-500">Status changes and tracking updates are logged automatically.</p>

            <form action={updateOrderStatusAction} className="mt-5">
              <input type="hidden" name="order_id" value={order.id} />
              <label className="text-sm font-medium text-surface-900">
                Status
                <select
                  name="status"
                  defaultValue={order.status}
                  className={inputClassName()}
                >
                  {ORDER_STATUS_TABS.filter((tab) => tab.value !== 'All').map((tab) => (
                    <option key={tab.value} value={tab.value}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="mt-3 rounded-xl border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100"
              >
                Update status
              </button>
            </form>

            <form action={updateTrackingAction} className="mt-5">
              <input type="hidden" name="order_id" value={order.id} />
              <label className="text-sm font-medium text-surface-900">
                Tracking number
                <input
                  type="text"
                  name="tracking_id"
                  defaultValue={order.tracking_id ?? ''}
                  placeholder="Add carrier tracking code"
                  className={inputClassName()}
                />
              </label>
              <button
                type="submit"
                className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Save and email customer
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900">General details</h2>
            <p className="mt-1 text-sm text-surface-500">Payment, coupon, attribution, and value adjustments.</p>

            <form action={updateOrderGeneralAction} className="mt-5 space-y-4">
              <input type="hidden" name="order_id" value={order.id} />
              <Field label="Customer email">
                <input type="email" name="customer_email" defaultValue={order.customer_email ?? ''} className={inputClassName()} />
              </Field>
              <Field label="Payment method">
                <input type="text" name="payment_method" defaultValue={order.payment_method ?? ''} className={inputClassName()} />
              </Field>
              <Field label="Payment gateway">
                <input type="text" name="payment_gateway" defaultValue={order.payment_gateway ?? ''} className={inputClassName()} />
              </Field>
              <Field label="Payment reference">
                <input type="text" name="payment_reference" defaultValue={order.payment_reference ?? ''} className={inputClassName()} />
              </Field>
              <Field label="Crypto TXID">
                <input type="text" name="crypto_txid" defaultValue={order.crypto_txid ?? ''} className={inputClassName()} />
              </Field>
              <Field label="Attribution source">
                <input type="text" name="attribution_source" defaultValue={order.attribution_source ?? ''} className={inputClassName()} />
              </Field>
              <Field label="Attribution detail">
                <input type="text" name="attribution_detail" defaultValue={order.attribution_detail ?? ''} className={inputClassName()} />
              </Field>
              <Field label="Coupon code">
                <input type="text" name="coupon_code" defaultValue={order.coupon_code ?? ''} className={inputClassName()} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Subtotal">
                  <input type="number" step="0.01" name="subtotal_amount" defaultValue={Number(order.subtotal_amount ?? order.total_amount)} className={inputClassName()} />
                </Field>
                <Field label="Shipping">
                  <input type="number" step="0.01" name="shipping_amount" defaultValue={Number(order.shipping_amount ?? 0)} className={inputClassName()} />
                </Field>
                <Field label="Tax">
                  <input type="number" step="0.01" name="tax_amount" defaultValue={Number(order.tax_amount ?? 0)} className={inputClassName()} />
                </Field>
                <Field label="Discount">
                  <input type="number" step="0.01" name="discount_amount" defaultValue={Number(order.discount_amount ?? 0)} className={inputClassName()} />
                </Field>
              </div>
              <button
                type="submit"
                className="rounded-xl bg-surface-900 px-4 py-2 text-sm font-medium text-white hover:bg-surface-800"
              >
                Save general details
              </button>
            </form>
          </section>

          <AddressCard
            orderId={order.id}
            section="billing"
            title="Billing address"
            subtitle={formatAddressSnippet(order.billing_address)}
            address={order.billing_address}
          />

          <AddressCard
            orderId={order.id}
            section="shipping"
            title="Shipping address"
            subtitle={formatAddressSnippet(order.shipping_address)}
            address={order.shipping_address}
          />

          <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-surface-900">Transaction metadata</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <MetadataRow label="Currency" value={order.currency_code ?? 'USD'} mono />
              <MetadataRow label="Created" value={new Date(order.created_at).toLocaleString()} />
              <MetadataRow label="Paid at" value={order.paid_at ? new Date(order.paid_at).toLocaleString() : 'Not marked paid'} />
              <MetadataRow label="Fulfilled at" value={order.fulfilled_at ? new Date(order.fulfilled_at).toLocaleString() : 'Not fulfilled'} />
              <MetadataRow label="Refunded at" value={order.refunded_at ? new Date(order.refunded_at).toLocaleString() : 'Not refunded'} />
              <MetadataRow label="Customer IP" value={order.ip_address ?? 'Unavailable'} mono />
              <MetadataRow label="User agent" value={order.user_agent ?? 'Unavailable'} />
            </dl>
            <div className="mt-5">
              <div className="text-sm font-medium text-surface-900">Gateway payload</div>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-surface-950/95 p-4 text-xs text-surface-100">
                {JSON.stringify(order.payment_metadata ?? {}, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-surface-500">{label}</div>
      <div className={`mt-2 text-sm font-semibold text-surface-900 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-surface-900">
      {label}
      {children}
    </label>
  );
}

function MetadataRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px,1fr]">
      <dt className="text-surface-500">{label}</dt>
      <dd className={`${mono ? 'font-mono' : ''} text-surface-900`}>{value}</dd>
    </div>
  );
}

function AddressCard({
  orderId,
  section,
  title,
  subtitle,
  address,
}: {
  orderId: string;
  section: 'billing' | 'shipping';
  title: string;
  subtitle: string;
  address: unknown;
}) {
  return (
    <section className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
      <p className="mt-1 text-sm text-surface-500">{subtitle}</p>
      <form action={updateOrderAddressesAction} className="mt-5 space-y-4">
        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="section" value={section} />
        <Field label="Address line 1">
          <input type="text" name={`${section}_line1`} defaultValue={getAddressValue(address, 'line1')} className={inputClassName()} />
        </Field>
        <Field label="Address line 2">
          <input type="text" name={`${section}_line2`} defaultValue={getAddressValue(address, 'line2')} className={inputClassName()} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City">
            <input type="text" name={`${section}_city`} defaultValue={getAddressValue(address, 'city')} className={inputClassName()} />
          </Field>
          <Field label="State / Region">
            <input type="text" name={`${section}_state`} defaultValue={getAddressValue(address, 'state')} className={inputClassName()} />
          </Field>
          <Field label="Postal code">
            <input type="text" name={`${section}_postal_code`} defaultValue={getAddressValue(address, 'postal_code')} className={inputClassName()} />
          </Field>
          <Field label="Country">
            <input type="text" name={`${section}_country`} defaultValue={getAddressValue(address, 'country')} className={inputClassName()} />
          </Field>
        </div>
        <button
          type="submit"
          className="rounded-xl border border-surface-300 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100"
        >
          Save {section} address
        </button>
      </form>
    </section>
  );
}
