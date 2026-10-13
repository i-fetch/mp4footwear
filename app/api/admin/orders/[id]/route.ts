import { NextRequest, NextResponse } from 'next/server';
import { isObjectIdOrHexString } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/lib/models';
import { isAuthenticatedAdmin } from '@/lib/adminApi';
import {
  fulfillmentStatuses,
  type FulfillmentStatus,
} from '@/lib/fulfillment';
import { isValidFulfillmentTransition } from '@/lib/orderTracking';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readOptionalText(
  value: unknown,
  maxLength: number
): string | undefined | null {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : undefined;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
    }

    const { id } = await params;
    if (!isObjectIdOrHexString(id)) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid order update.' }, { status: 400 });
    }

    let nextStatus: FulfillmentStatus | undefined;
    if (body.fulfillmentStatus !== undefined) {
      if (
        typeof body.fulfillmentStatus !== 'string' ||
        !fulfillmentStatuses.includes(body.fulfillmentStatus as FulfillmentStatus)
      ) {
        return NextResponse.json({ error: 'Invalid fulfillment status.' }, { status: 400 });
      }
      nextStatus = body.fulfillmentStatus as FulfillmentStatus;
    }

    const trackingUpdateMessage = readOptionalText(body.trackingUpdateMessage, 500);
    const carrier = readOptionalText(body.carrier, 120);
    const trackingNumber = readOptionalText(body.trackingNumber, 120);
    const trackingUrl = readOptionalText(body.trackingUrl, 2048);
    if (
      (body.trackingUpdateMessage !== undefined &&
        (typeof body.trackingUpdateMessage !== 'string' ||
          !body.trackingUpdateMessage.trim() ||
          body.trackingUpdateMessage.trim().length > 500)) ||
      (body.carrier !== undefined && carrier === undefined) ||
      (body.trackingNumber !== undefined && trackingNumber === undefined) ||
      (body.trackingUrl !== undefined && trackingUrl === undefined)
    ) {
      return NextResponse.json({ error: 'One or more fields are invalid.' }, { status: 400 });
    }
    if (trackingUrl) {
      try {
        const url = new URL(trackingUrl);
        if (
          url.protocol !== 'https:' ||
          url.username.length > 0 ||
          url.password.length > 0
        ) {
          throw new Error();
        }
      } catch {
        return NextResponse.json(
          { error: 'Tracking links must be valid HTTPS URLs.' },
          { status: 400 }
        );
      }
    }

    let estimatedDeliveryAt: Date | null | undefined;
    if (body.estimatedDeliveryAt !== undefined) {
      if (body.estimatedDeliveryAt === null || body.estimatedDeliveryAt === '') {
        estimatedDeliveryAt = null;
      } else if (typeof body.estimatedDeliveryAt === 'string') {
        estimatedDeliveryAt = new Date(body.estimatedDeliveryAt);
        if (Number.isNaN(estimatedDeliveryAt.getTime())) {
          return NextResponse.json(
            { error: 'Estimated delivery date is invalid.' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Estimated delivery date is invalid.' },
          { status: 400 }
        );
      }
    }

    await connectDB();
    const order = await Order.findById(id).select(
      'paymentStatus fulfillmentStatus'
    );
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const currentStatus =
      (order.fulfillmentStatus as FulfillmentStatus | undefined) || 'PROCESSING';
    const statusToSave = nextStatus || currentStatus;
    if (!isValidFulfillmentTransition(currentStatus, statusToSave)) {
      return NextResponse.json(
        { error: `Cannot change fulfillment from ${currentStatus} to ${statusToSave}.` },
        { status: 409 }
      );
    }
    if (
      ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(statusToSave) &&
      order.paymentStatus !== 'PAID'
    ) {
      return NextResponse.json(
        { error: 'Only paid orders can be shipped or delivered.' },
        { status: 409 }
      );
    }

    const set: Record<string, unknown> = { fulfillmentStatus: statusToSave };
    const unset: Record<string, 1> = {};
    if (carrier !== undefined) {
      if (carrier === null) unset['shipping.carrier'] = 1;
      else set['shipping.carrier'] = carrier;
    }
    if (trackingNumber !== undefined) {
      if (trackingNumber === null) unset['shipping.trackingNumber'] = 1;
      else set['shipping.trackingNumber'] = trackingNumber;
    }
    if (trackingUrl !== undefined) {
      if (trackingUrl === null) unset['shipping.trackingUrl'] = 1;
      else set['shipping.trackingUrl'] = trackingUrl;
    }
    if (estimatedDeliveryAt !== undefined) {
      if (estimatedDeliveryAt === null) unset['shipping.estimatedDeliveryAt'] = 1;
      else set['shipping.estimatedDeliveryAt'] = estimatedDeliveryAt;
    }

    const statusChanged = currentStatus !== statusToSave;
    const shouldAppendUpdate =
      statusChanged || trackingUpdateMessage !== undefined;
    if (statusChanged && statusToSave === 'SHIPPED') {
      set['shipping.shippedAt'] = new Date();
    }
    if (statusChanged && statusToSave === 'DELIVERED') {
      set['shipping.deliveredAt'] = new Date();
    }

    const update: Record<string, unknown> = { $set: set };
    if (Object.keys(unset).length > 0) update.$unset = unset;
    if (shouldAppendUpdate) {
      const message =
        trackingUpdateMessage ||
        (statusChanged
          ? `Order status updated to ${statusToSave.replaceAll('_', ' ').toLowerCase()}.`
          : '');
      update.$push = {
        trackingUpdates: {
          status: statusToSave,
          message,
          createdAt: new Date(),
        },
      };
    }

    const result = await Order.updateOne(
      {
        _id: order._id,
        paymentStatus: order.paymentStatus,
        $or: [
          { fulfillmentStatus: currentStatus },
          { fulfillmentStatus: { $exists: false } },
        ],
      },
      update
    );
    if (result.matchedCount !== 1) {
      return NextResponse.json(
        { error: 'Order changed during this update. Reload and try again.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: 'Order tracking updated.' });
  } catch (error) {
    console.error('Admin order update failed', {
      reason: 'admin_order_update_error',
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return NextResponse.json(
      { error: 'Unable to update order tracking right now.' },
      { status: 500 }
    );
  }
}
