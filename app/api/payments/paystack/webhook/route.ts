import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  getPaystackSecret,
  markPaystackPaymentFailed,
  PaystackApiError,
  verifyAndApplyPaystackPayment,
} from '@/lib/paystack';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secret = getPaystackSecret();
  if (!secret) {
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('x-paystack-signature');
  if (!signature || !/^[a-f\d]{128}$/i.test(signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  const rawBody = await request.text();
  const expectedSignature = createHmac('sha512', secret)
    .update(rawBody)
    .digest();
  const suppliedSignature = Buffer.from(signature, 'hex');
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }
  if (
    typeof payload !== 'object' ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  const event = payload as {
    event?: unknown;
    data?: { reference?: unknown } | null;
  };
  const eventName = event.event;
  const reference = event.data?.reference;
  if (eventName === 'charge.success' || eventName === 'charge.failed') {
    if (
      typeof reference !== 'string' ||
      !/^[A-Za-z0-9_-]{8,100}$/.test(reference)
    ) {
      return NextResponse.json(
        { error: 'Webhook payment reference is invalid.' },
        { status: 400 }
      );
    }

    try {
      if (eventName === 'charge.success') {
        const result = await verifyAndApplyPaystackPayment(reference);
        if (result.httpStatus >= 500) {
          return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
        }
      } else {
        await markPaystackPaymentFailed(reference);
      }
    } catch (error) {
      console.error('Paystack webhook processing error', {
        reason:
          error instanceof PaystackApiError
            ? error.diagnosticCode
            : 'webhook_processing_error',
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
      return NextResponse.json(
        {
          error:
            error instanceof PaystackApiError
              ? 'Could not verify the payment with Paystack.'
              : 'Webhook processing failed.',
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
