import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/models';
import {
  allowTrackingAttempt,
  createOrderReference,
  hashTrackingCode,
} from '@/lib/orderTracking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () =>
  NextResponse.json(
    { error: 'Order not found. Check your reference and tracking code.' },
    { status: 404 }
  );

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  try {
    if (!(await allowTrackingAttempt(request))) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return notFound();
    }

    if (!isRecord(body)) return notFound();
    const submittedReference =
      typeof body.orderReference === 'string' ? body.orderReference.trim() : '';
    const orderReference = /^mp4-/i.test(submittedReference)
      ? submittedReference.toUpperCase()
      : submittedReference;
    const trackingCode =
      typeof body.trackingCode === 'string' ? body.trackingCode.trim() : '';
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone =
      typeof body.phone === 'string'
        ? body.phone.trim().replace(/[^\d+]/g, '')
        : '';
    if (
      !/^(?:MP4-[A-F0-9]{24}|[A-Za-z0-9_-]{8,100})$/.test(orderReference) ||
      (trackingCode && !/^[A-Za-z0-9_-]{43}$/.test(trackingCode)) ||
      (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) ||
      phone.length > 30
    ) {
      return notFound();
    }

    const order = await Order.findOne({
      $or: [
        { orderReference },
        {
          orderReference: null,
          paystackReference: orderReference,
        },
      ],
    })
      .select(
        'orderReference trackingTokenHash customer.email customer.phone fulfillmentStatus createdAt trackingUpdates items shipping'
      )
      .select('+trackingTokenHash')
      .lean();
    if (!order) return notFound();

    if (order.trackingTokenHash) {
      if (!/^[A-Za-z0-9_-]{43}$/.test(trackingCode)) return notFound();
      const providedHash = Buffer.from(hashTrackingCode(trackingCode), 'hex');
      const savedHash = Buffer.from(order.trackingTokenHash, 'hex');
      if (
        providedHash.length !== savedHash.length ||
        !timingSafeEqual(providedHash, savedHash)
      ) {
        return notFound();
      }
    } else {
      const storedEmailHash = createHash('sha256')
        .update(order.customer.email.trim().toLowerCase())
        .digest();
      const providedEmailHash = createHash('sha256').update(email).digest();
      const storedPhoneHash = createHash('sha256')
        .update(order.customer.phone.trim().replace(/[^\d+]/g, ''))
        .digest();
      const providedPhoneHash = createHash('sha256').update(phone).digest();
      if (
        !email ||
        !phone ||
        !timingSafeEqual(providedEmailHash, storedEmailHash) ||
        !timingSafeEqual(providedPhoneHash, storedPhoneHash)
      ) {
        return notFound();
      }

      if (!order.orderReference) {
        const candidateReference = createOrderReference();
        await Order.updateOne(
          { _id: order._id, orderReference: null },
          { $set: { orderReference: candidateReference } }
        );
      }
    }

    const publicOrderReference =
      order.orderReference ||
      (
        await Order.findById(order._id).select('orderReference').lean()
      )?.orderReference;
    if (!publicOrderReference) {
      return NextResponse.json(
        { error: 'Unable to retrieve tracking details right now.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order: {
        orderReference: publicOrderReference,
        fulfillmentStatus: order.fulfillmentStatus || 'PROCESSING',
        createdAt: order.createdAt,
        items: order.items.map((item: { name: string; size: number; quantity: number }) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
        })),
        shipping: {
          carrier: order.shipping?.carrier,
          trackingNumber: order.shipping?.trackingNumber,
          trackingUrl: order.shipping?.trackingUrl,
          estimatedDeliveryAt: order.shipping?.estimatedDeliveryAt,
          shippedAt: order.shipping?.shippedAt,
          deliveredAt: order.shipping?.deliveredAt,
        },
        trackingUpdates: (order.trackingUpdates || []).map(
          (update: { status: string; message: string; createdAt: Date }) => ({
            status: update.status,
            message: update.message,
            createdAt: update.createdAt,
          })
        ),
      },
    });
  } catch (error) {
    console.error('Order tracking request failed', {
      reason: 'tracking_lookup_error',
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return NextResponse.json(
      { error: 'Unable to retrieve tracking details right now.' },
      { status: 500 }
    );
  }
}
