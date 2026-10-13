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
    console.warn('Paystack verification request rejected', {
      reason: 'missing_or_invalid_reference',
    });
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
        orderReference: result.orderReference,
        amountKobo: result.amountKobo,
        currency: result.currency,
      },
      { status: result.httpStatus }
    );
  } catch (error) {
    const isPaystackError = error instanceof PaystackApiError;
    console.error('Paystack verification request failed', {
      reason: isPaystackError ? error.diagnosticCode : 'verification_internal_error',
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });
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
