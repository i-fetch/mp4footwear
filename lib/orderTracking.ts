import { createHash, randomBytes } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ApiRateLimit } from '@/lib/models';
import type { FulfillmentStatus } from '@/lib/fulfillment';
export { fulfillmentStatuses, type FulfillmentStatus } from '@/lib/fulfillment';

export function createOrderReference(): string {
  return `MP4-${randomBytes(12).toString('hex').toUpperCase()}`;
}

export function createTrackingCode(): string {
  return randomBytes(32).toString('base64url');
}

export function hashTrackingCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export async function allowTrackingAttempt(
  request: NextRequest
): Promise<boolean> {
  await connectDB();
  const forwardedFor = request.headers.get('x-forwarded-for');
  const address =
    request.headers.get('x-real-ip')?.trim() ||
    forwardedFor?.split(',').at(-1)?.trim() ||
    'unknown';
  const window = Math.floor(Date.now() / 60_000);
  const ipHash = createHash('sha256').update(address).digest('hex');
  const key = `order-track:${ipHash}:${window}`;
  const expiresAt = new Date((window + 2) * 60_000);

  const result = await ApiRateLimit.findOneAndUpdate(
    { _id: key },
    {
      $inc: { requests: 1 },
      $setOnInsert: { expiresAt },
    },
    { upsert: true, returnDocument: 'after', projection: { requests: 1 } }
  ).lean();

  return (result?.requests ?? 0) <= 12;
}

export function isValidFulfillmentTransition(
  current: FulfillmentStatus,
  next: FulfillmentStatus
): boolean {
  const transitions: Record<FulfillmentStatus, FulfillmentStatus[]> = {
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  return current === next || transitions[current].includes(next);
}
