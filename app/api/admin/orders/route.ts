import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/lib/models';
import { isAuthenticatedAdmin } from '@/lib/adminApi';

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({})
      .select(
        'orderReference customer delivery items amountKobo currency paymentStatus paystackReference paystackTransactionId paidAt fulfillmentStatus shipping trackingUpdates createdAt updatedAt'
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Admin order list failed', {
      reason: 'admin_order_list_error',
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
    return NextResponse.json(
      { error: 'Unable to load orders right now.' },
      { status: 500 }
    );
  }
}
