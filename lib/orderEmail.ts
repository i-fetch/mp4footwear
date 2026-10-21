export interface OrderEmailItem {
  name: string;
  size: number;
  quantity: number;
}

export interface OrderEmailDetails {
  email: string;
  customerName: string;
  orderReference: string;
  items: OrderEmailItem[];
  amountKobo: number;
  currency: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryAt?: Date | string;
}

type OrderEmailKind = 'paid' | 'shipped' | 'delivered';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function formatAmount(amountKobo: number, currency: string): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amountKobo / 100);
}

function formatDate(value?: Date | string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? undefined
    : date.toLocaleDateString('en-NG', { dateStyle: 'long' });
}

function emailContent(kind: OrderEmailKind, order: OrderEmailDetails) {
  const trackUrl = new URL(
    `/track-order?reference=${encodeURIComponent(order.orderReference)}`,
    process.env.NEXT_PUBLIC_SITE_URL
  ).toString();
  const name = escapeHtml(order.customerName);
  const reference = escapeHtml(order.orderReference);
  const itemsText = order.items
    .map((item) => `${item.name} · size ${item.size} · qty ${item.quantity}`)
    .join('\n');
  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.name)} · size ${item.size} · qty ${item.quantity}</li>`
    )
    .join('');

  if (kind === 'paid') {
    const subject = `Payment confirmed — order ${order.orderReference}`;
    const text = [
      `Hello ${order.customerName},`,
      '',
      `Your payment is confirmed. Your order reference is ${order.orderReference}.`,
      `Order total: ${formatAmount(order.amountKobo, order.currency)}.`,
      '',
      'Items:',
      itemsText,
      '',
      `Track your order: ${trackUrl}`,
      'Use your order reference and the private tracking code shown after checkout. Keep that code safe; support will need to verify ownership if it is lost.',
    ].join('\n');
    const html = `<p>Hello ${name},</p><p>Your payment is confirmed. Your order reference is <strong>${reference}</strong>.</p><p>Order total: <strong>${escapeHtml(formatAmount(order.amountKobo, order.currency))}</strong></p><p>Items:</p><ul>${itemsHtml}</ul><p><a href="${escapeHtml(trackUrl)}">Track your order</a></p><p>Use your order reference and the private tracking code shown after checkout. Keep that code safe; support will need to verify ownership if it is lost.</p>`;
    return { subject, text, html };
  }

  if (kind === 'shipped') {
    const subject = `Your order has shipped — ${order.orderReference}`;
    const carrier = order.carrier ? `Carrier: ${order.carrier}` : '';
    const trackingNumber = order.trackingNumber
      ? `Tracking number: ${order.trackingNumber}`
      : '';
    const estimatedDelivery = formatDate(order.estimatedDeliveryAt);
    const eta = estimatedDelivery
      ? `Estimated delivery: ${estimatedDelivery}`
      : '';
    const carrierLink = order.trackingUrl
      ? `Carrier tracking: ${order.trackingUrl}`
      : '';
    const details = [carrier, trackingNumber, eta, carrierLink]
      .filter(Boolean)
      .join('\n');
    const detailsHtml = [carrier, trackingNumber, eta]
      .filter(Boolean)
      .map((detail) => `<li>${escapeHtml(detail)}</li>`)
      .join('');
    const carrierLinkHtml = order.trackingUrl
      ? `<li><a href="${escapeHtml(order.trackingUrl)}">Track with the carrier</a></li>`
      : '';
    const text = [
      `Hello ${order.customerName},`,
      '',
      `Order ${order.orderReference} has been dispatched.`,
      details,
      '',
      `View your order updates: ${trackUrl}`,
      'Use your order reference and private tracking code to view delivery history.',
    ]
      .filter(Boolean)
      .join('\n');
    const html = `<p>Hello ${name},</p><p>Order <strong>${reference}</strong> has been dispatched.</p><ul>${detailsHtml}${carrierLinkHtml}</ul><p><a href="${escapeHtml(trackUrl)}">View your order updates</a></p><p>Use your order reference and private tracking code to view delivery history.</p>`;
    return { subject, text, html };
  }

  const subject = `Your order was delivered — ${order.orderReference}`;
  const text = [
    `Hello ${order.customerName},`,
    '',
    `Order ${order.orderReference} has been marked as delivered.`,
    `View your order updates: ${trackUrl}`,
  ].join('\n');
  const html = `<p>Hello ${name},</p><p>Order <strong>${reference}</strong> has been marked as delivered.</p><p><a href="${escapeHtml(trackUrl)}">View your order updates</a></p>`;
  return { subject, text, html };
}

export async function sendOrderEmail(
  kind: OrderEmailKind,
  order: OrderEmailDetails
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!apiKey || !from || !siteUrl) {
    console.warn('Order email was not sent', {
      kind,
      reason: 'resend_configuration_missing',
    });
    return;
  }

  let content: ReturnType<typeof emailContent>;
  try {
    const baseUrl = new URL(siteUrl);
    if (
      (process.env.NODE_ENV === 'production' && baseUrl.protocol !== 'https:') ||
      !['http:', 'https:'].includes(baseUrl.protocol)
    ) {
      throw new Error('Invalid site URL');
    }
    content = emailContent(kind, order);
  } catch {
    console.error('Order email was not sent', {
      kind,
      reason: 'invalid_site_url',
    });
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [order.email],
        subject: content.subject,
        html: content.html,
        text: content.text,
        ...(process.env.ORDER_EMAIL_REPLY_TO
          ? { reply_to: process.env.ORDER_EMAIL_REPLY_TO }
          : {}),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error('Order email delivery failed', {
        kind,
        reason: 'resend_rejected_request',
        httpStatus: response.status,
      });
      return;
    }
    console.info('Order email sent', { kind });
  } catch (error) {
    console.error('Order email delivery failed', {
      kind,
      reason: 'resend_network_error',
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
  }
}
