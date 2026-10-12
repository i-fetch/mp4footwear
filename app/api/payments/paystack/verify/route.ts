import { NextRequest, NextResponse } from 'next/server';
import {
  PaystackApiError,
  verifyAndApplyPaystackPayment,
} from '@/lib/paystack';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get('reference') ||
    request.nextUrl.searchParams.get('trxref');
  if (!reference || !/^[A-Za-z0-9_-]{8,100}$/.test(reference)) {
    return NextResponse.json(
      { error: 'A valid Paystack payment reference is required.' },
      { status: 400 }
    );
  }

  try {
    const result = await verifyAndApplyPaystackPayment(reference);
    return NextResponse.json(
      {
        paymentStatus: result.paymentStatus,
        message: result.message,
        orderId: result.orderId,
        amountKobo: result.amountKobo,
        currency: result.currency,
      },
      { status: result.httpStatus }
    );
  } catch (error) {
    console.error('Paystack verification error:', error);
    const isPaystackError = error instanceof PaystackApiError;
    return NextResponse.json(
      {
        error:
          isPaystackError
            ? 'Unable to verify payment with Paystack right now.'
            : 'Unable to verify this payment right now.',
      },
      { status: isPaystackError ? 502 : 500 }
    );
  }
}
