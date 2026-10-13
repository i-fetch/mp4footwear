'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { SiteLoader } from '@/components/SiteLoader';
import { fulfillmentStatuses } from '@/lib/fulfillment';

interface AdminOrder {
  _id: string;
  orderReference?: string;
  customer: { name: string; email: string; phone: string };
  delivery: { address: string; city: string };
  items: Array<{ name: string; size: number; quantity: number }>;
  amountKobo: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus?: string;
  shipping?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDeliveryAt?: string;
  };
  trackingUpdates?: Array<{
    status: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const loadOrders = useCallback(async () => {
    setError('');
    try {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (response.status === 401) {
        router.replace('/admin');
        return;
      }
      const body = (await response.json()) as {
        orders?: AdminOrder[];
        error?: string;
      };
      if (!response.ok || !Array.isArray(body.orders)) {
        throw new Error(body.error || 'Unable to load orders.');
      }
      setOrders(body.orders);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const updateOrder = async (
    event: FormEvent<HTMLFormElement>,
    order: AdminOrder
  ) => {
    event.preventDefault();
    setSavingId(order._id);
    setError('');
    setNotice('');
    const formData = new FormData(event.currentTarget);
    const estimatedDelivery = String(formData.get('estimatedDeliveryAt') || '');
    const trackingUpdateMessage = String(
      formData.get('trackingUpdateMessage') || ''
    ).trim();
    const payload: Record<string, unknown> = {
      fulfillmentStatus: formData.get('fulfillmentStatus'),
      carrier: formData.get('carrier') || null,
      trackingNumber: formData.get('trackingNumber') || null,
      trackingUrl: formData.get('trackingUrl') || null,
      estimatedDeliveryAt: estimatedDelivery
        ? new Date(estimatedDelivery).toISOString()
        : null,
    };
    if (trackingUpdateMessage) {
      payload.trackingUpdateMessage = trackingUpdateMessage;
    }

    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || 'Unable to update this order.');
      }
      setNotice(`Order ${order.orderReference || ''} updated.`);
      await loadOrders();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update this order.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <SiteLoader message="Loading orders" />;

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <header className="sticky top-0 z-40 border-b border-slate-700 bg-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Order management</h1>
            <Link
              href="/admin/dashboard"
              className="text-sm text-slate-300 underline"
            >
              Back to dashboard
            </Link>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-4 py-8">
        {error && (
          <p role="alert" className="rounded border border-red-500 p-4 text-red-300">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded border border-green-600 p-4 text-green-300">
            {notice}
          </p>
        )}
        {orders.length === 0 ? (
          <p className="rounded-lg bg-slate-800 p-8 text-center text-slate-300">
            No orders have been placed yet.
          </p>
        ) : (
          orders.map((order) => {
            const fulfillmentStatus = order.fulfillmentStatus || 'PROCESSING';
            return (
              <article
                key={order._id}
                className="space-y-6 rounded-lg border border-slate-700 bg-slate-800 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <h2 className="text-xl font-bold">
                      {order.orderReference || 'Legacy order'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">
                      Placed {new Date(order.createdAt).toLocaleString()} ·{' '}
                      {order.customer.name} · {order.customer.email} ·{' '}
                      {order.customer.phone}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Deliver to: {order.delivery.address}, {order.delivery.city}
                    </p>
                    <ul className="mt-2 text-sm text-slate-300">
                      {order.items.map((item, index) => (
                        <li key={`${item.name}-${item.size}-${index}`}>
                          {item.name} · size {item.size} · qty {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="shrink-0 text-sm md:text-right">
                    <p>
                      Payment: <strong>{order.paymentStatus}</strong>
                    </p>
                    <p>
                      Fulfillment: <strong>{fulfillmentStatus}</strong>
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      ₦{(order.amountKobo / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(event) => void updateOrder(event, order)}
                  className="grid grid-cols-1 gap-4 border-t border-slate-700 pt-5 md:grid-cols-2"
                >
                  <label className="space-y-2 text-sm">
                    <span>Fulfillment status</span>
                    <select
                      name="fulfillmentStatus"
                      defaultValue={fulfillmentStatus}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                    >
                      {fulfillmentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span>Carrier</span>
                    <input
                      name="carrier"
                      defaultValue={order.shipping?.carrier || ''}
                      maxLength={120}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span>Tracking number</span>
                    <input
                      name="trackingNumber"
                      defaultValue={order.shipping?.trackingNumber || ''}
                      maxLength={120}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span>Carrier tracking URL (HTTPS)</span>
                    <input
                      name="trackingUrl"
                      type="url"
                      defaultValue={order.shipping?.trackingUrl || ''}
                      maxLength={2048}
                      className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span>Estimated delivery</span>
                    <input
                      name="estimatedDeliveryAt"
                      type="datetime-local"
                      defaultValue={
                        order.shipping?.estimatedDeliveryAt
                          ? new Date(order.shipping.estimatedDeliveryAt)
                              .toISOString()
                              .slice(0, 16)
                          : ''
                      }
                      className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-2 text-sm md:col-span-2">
                    <span>Customer tracking update</span>
                    <textarea
                      name="trackingUpdateMessage"
                      maxLength={500}
                      rows={2}
                      placeholder="Optional update to append to the delivery history"
                      className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
                    />
                  </label>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={savingId === order._id}
                      className="rounded bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                      {savingId === order._id ? 'Saving…' : 'Save order update'}
                    </button>
                  </div>
                </form>

                {order.trackingUpdates && order.trackingUpdates.length > 0 && (
                  <ol className="space-y-2 border-t border-slate-700 pt-4 text-sm text-slate-300">
                    {order.trackingUpdates.map((update, index) => (
                      <li key={`${update.createdAt}-${index}`}>
                        {new Date(update.createdAt).toLocaleString()} ·{' '}
                        {update.status}: {update.message}
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
