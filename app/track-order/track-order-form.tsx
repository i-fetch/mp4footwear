'use client';

import { FormEvent, useEffect, useState } from 'react';

interface TrackedOrder {
  orderReference: string;
  fulfillmentStatus: string;
  createdAt: string;
  items: Array<{ name: string; size: number; quantity: number }>;
  shipping: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDeliveryAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  trackingUpdates: Array<{
    status: string;
    message: string;
    createdAt: string;
  }>;
}

function displayDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
}

export default function TrackOrderForm({
  initialReference,
}: {
  initialReference: string;
}) {
  const [orderReference, setOrderReference] = useState(initialReference);
  const [trackingCode, setTrackingCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const normalizedReference = initialReference.trim().toUpperCase();
    if (!normalizedReference) return;
    setOrderReference(normalizedReference);
    const savedCode = sessionStorage.getItem(
      `mp4-order-tracking:${normalizedReference}`
    );
    if (savedCode) setTrackingCode(savedCode);
  }, [initialReference]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrder(null);
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderReference, trackingCode, email, phone }),
      });
      const body = (await response.json()) as {
        order?: TrackedOrder;
        error?: string;
      };
      if (!response.ok || !body.order) {
        throw new Error(body.error || 'Unable to find this order.');
      }
      setOrder(body.order);
      setOrderReference(body.order.orderReference);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to retrieve tracking details right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={submit} className="mt-8 space-y-5 border border-border p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Order reference</span>
          <input
            value={orderReference}
            onChange={(event) => setOrderReference(event.target.value)}
            autoComplete="off"
            maxLength={40}
            required
            className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30"
            placeholder="MP4-… or previous Paystack reference"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Private tracking code (new orders)</span>
          <input
            value={trackingCode}
            onChange={(event) => setTrackingCode(event.target.value)}
            autoComplete="off"
            maxLength={64}
            className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30"
            placeholder="43-character code provided after checkout"
          />
        </label>
        <p className="text-sm text-muted-foreground">
          For older orders, leave the tracking code empty and provide the email
          address and phone number used at checkout.
        </p>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Checkout email (older orders)</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            maxLength={254}
            className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Checkout phone (older orders)</span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            maxLength={30}
            className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground px-6 py-3 font-semibold text-background disabled:opacity-60"
        >
          {loading ? 'Looking up order…' : 'Track order'}
        </button>
      </form>

      {order && (
        <section
          aria-live="polite"
          className="mt-8 space-y-8 border border-border p-6"
        >
          <div>
            <p className="text-sm text-muted-foreground">
              Order {order.orderReference}
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              {order.fulfillmentStatus.replaceAll('_', ' ')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {displayDate(order.createdAt)}
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Items</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {order.items.map((item, index) => (
                <li key={`${item.name}-${item.size}-${index}`}>
                  {item.name} · Size {item.size} · Qty {item.quantity}
                </li>
              ))}
            </ul>
          </div>

          {(order.shipping.carrier ||
            order.shipping.trackingNumber ||
            order.shipping.estimatedDeliveryAt) && (
            <div>
              <h3 className="font-semibold">Delivery</h3>
              <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
                {order.shipping.carrier && (
                  <div>Carrier: {order.shipping.carrier}</div>
                )}
                {order.shipping.trackingNumber && (
                  <div>Tracking number: {order.shipping.trackingNumber}</div>
                )}
                {order.shipping.estimatedDeliveryAt && (
                  <div>
                    Estimated delivery: {displayDate(order.shipping.estimatedDeliveryAt)}
                  </div>
                )}
              </dl>
              {order.shipping.trackingUrl && (
                <a
                  href={order.shipping.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex font-semibold underline"
                >
                  Open carrier tracking
                </a>
              )}
            </div>
          )}

          <div>
            <h3 className="font-semibold">Tracking history</h3>
            {order.trackingUpdates.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No delivery updates yet.
              </p>
            ) : (
              <ol className="mt-4 space-y-4 border-l border-border pl-5">
                {order.trackingUpdates.map((update, index) => (
                  <li key={`${update.createdAt}-${index}`}>
                    <p className="font-medium">
                      {update.status.replaceAll('_', ' ')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {update.message}
                    </p>
                    <time className="mt-1 block text-xs text-muted-foreground">
                      {displayDate(update.createdAt)}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}
    </>
  );
}
