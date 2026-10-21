import { randomBytes } from 'node:crypto';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/lib/models';
import { sendOrderEmail } from '@/lib/orderEmail';

interface PaystackTransaction {
  id: number | string;
  reference: string;
  status: string;
  amount: number;
  requested_amount?: number;
  fees?: number | null;
  currency: string;
  customer?: { email?: string };
  metadata?: { order_id?: string };
}

interface PaystackEnvelope<T> {
  status: boolean;
  message?: string;
  data?: T;
}

export class PaystackApiError extends Error {
  constructor(
    message: string,
    readonly diagnosticCode: string
  ) {
    super(message);
    this.name = 'PaystackApiError';
  }
}

export function getPaystackSecret(): string | null {
  return process.env.PAYSTACK_SECRET_KEY || null;
}

export function createPaystackReference(): string {
  return `mp4_${randomBytes(16).toString('hex')}`;
}

async function paystackRequest<T>(
  path: string,
  options: RequestInit
): Promise<T> {
  const secret = getPaystackSecret();
  if (!secret) {
    throw new PaystackApiError('Paystack is not configured.', 'missing_secret_key');
  }

  let response: Response;
  try {
    response = await fetch(`https://api.paystack.co${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    console.error('Paystack API request failed', {
      reason: 'network_error',
      endpoint: path.startsWith('/transaction/verify/') ? 'verify' : 'initialize',
    });
    throw new PaystackApiError('Could not connect to Paystack.', 'network_error');
  }

  let envelope: PaystackEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as PaystackEnvelope<T>;
  } catch {
    console.error('Paystack API request failed', {
      reason: 'invalid_json_response',
      endpoint: path.startsWith('/transaction/verify/') ? 'verify' : 'initialize',
      httpStatus: response.status,
    });
    throw new PaystackApiError(
      'Paystack returned an invalid response.',
      'invalid_json_response'
    );
  }

  if (!response.ok || !envelope.status || !envelope.data) {
    console.error('Paystack API request rejected', {
      reason: 'provider_rejected_request',
      endpoint: path.startsWith('/transaction/verify/') ? 'verify' : 'initialize',
      httpStatus: response.status,
      providerAccepted: envelope.status,
    });
    throw new PaystackApiError(
      'Paystack could not process the request.',
      'provider_rejected_request'
    );
  }

  return envelope.data;
}

export interface InitializePaystackInput {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  orderId: string;
  customerName: string;
  phone: string;
}

export interface PaystackInitialization {
  authorization_url: string;
  reference: string;
}

export function initializePaystackTransaction(
  input: InitializePaystackInput
): Promise<PaystackInitialization> {
  return paystackRequest<PaystackInitialization>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: 'NGN',
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: {
        order_id: input.orderId,
        customer_name: input.customerName,
        phone: input.phone,
      },
    }),
  });
}

export function verifyPaystackTransaction(
  reference: string
): Promise<PaystackTransaction> {
  return paystackRequest<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: 'GET' }
  );
}

export type PaymentVerification = {
  httpStatus: number;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';
  message: string;
  orderReference?: string;
  amountKobo?: number;
  currency?: string;
};

export async function verifyAndApplyPaystackPayment(
  reference: string
): Promise<PaymentVerification> {
  if (!getPaystackSecret()) {
    throw new PaystackApiError('Paystack is not configured.', 'missing_secret_key');
  }

  await connectDB();
  const order = await Order.findOne({
    'paymentAttempts.reference': reference,
  });
  if (!order) {
    console.warn('Paystack verification did not match an order', {
      reason: 'order_not_found_for_reference',
    });
    return {
      httpStatus: 404,
      paymentStatus: 'FAILED',
      message: 'No order was found for this payment reference.',
    };
  }

  const attempt = order.paymentAttempts.find(
    (payment: { reference: string }) => payment.reference === reference
  );
  if (!attempt) {
    console.warn('Paystack verification did not match a payment attempt', {
      reason: 'attempt_not_found_for_reference',
    });
    return {
      httpStatus: 404,
      paymentStatus: 'FAILED',
      message: 'No payment attempt was found for this reference.',
    };
  }

  const orderId = order._id.toString();
  if (order.paymentStatus === 'PAID') {
    if (order.paystackReference !== reference) {
      return {
        httpStatus: 409,
        paymentStatus: 'FAILED',
        message: 'This order has already been paid using another transaction.',
        orderReference: order.orderReference || order.paystackReference,
      };
    }

    return {
      httpStatus: 200,
      paymentStatus: 'PAID',
      message: 'Payment verified.',
      orderReference: order.orderReference || order.paystackReference,
      amountKobo: order.amountKobo,
      currency: order.currency,
    };
  }

  const transaction = await verifyPaystackTransaction(reference);
  if (transaction.reference !== reference) {
    console.warn('Paystack transaction verification rejected', {
      reason: 'verified_reference_mismatch',
    });
    return {
      httpStatus: 409,
      paymentStatus: 'FAILED',
      message: 'The transaction reference could not be verified.',
      orderReference: order.orderReference || order.paystackReference,
    };
  }

  if (transaction.status !== 'success') {
    const isFailed = transaction.status === 'failed';
    const isCancelled = transaction.status === 'abandoned';
    if (isFailed || isCancelled) {
      const paymentStatus = isCancelled ? 'CANCELLED' : 'FAILED';
      const update = await Order.updateOne(
        {
          _id: order._id,
          paymentStatus: { $ne: 'PAID' },
          'paymentAttempts.reference': reference,
        },
        {
          $set: {
            paymentStatus,
            'paymentAttempts.$.status': paymentStatus,
          },
        }
      );
      if (update.matchedCount !== 1) {
        console.error('Paystack payment status update did not match an order', {
          reason: 'failure_status_update_no_match',
        });
      }
      console.warn('Paystack transaction is not successful', {
        reason: isCancelled ? 'transaction_abandoned' : 'transaction_failed',
        transactionStatus: transaction.status,
      });
      return {
        httpStatus: 200,
        paymentStatus,
        message: isCancelled
          ? 'The payment was abandoned. You can return to checkout and try again.'
          : 'Paystack reported that this payment failed. You can try again at checkout.',
        orderReference: order.orderReference || order.paystackReference,
        amountKobo: order.amountKobo,
        currency: order.currency,
      };
    }

    console.info('Paystack transaction is awaiting confirmation', {
      reason: 'transaction_not_final',
      transactionStatus: transaction.status,
    });
    return {
      httpStatus: 200,
      paymentStatus: 'PENDING',
      message: 'Payment is not yet confirmed. Check again shortly.',
      orderReference: order.orderReference || order.paystackReference,
      amountKobo: order.amountKobo,
      currency: order.currency,
    };
  }

  const customerEmail = order.customer.email.toLowerCase();
  const requestedAmountKobo =
    transaction.requested_amount ?? transaction.amount;
  const amountFieldsAreValid =
    Number.isSafeInteger(transaction.amount) &&
    transaction.amount > 0 &&
    Number.isSafeInteger(requestedAmountKobo) &&
    requestedAmountKobo > 0 &&
    transaction.amount >= requestedAmountKobo &&
    (transaction.fees == null ||
      (Number.isSafeInteger(transaction.fees) &&
        transaction.fees >= 0 &&
        transaction.amount - requestedAmountKobo === transaction.fees));
  if (
    (transaction.metadata?.order_id !== undefined &&
      transaction.metadata.order_id !== orderId) ||
    !amountFieldsAreValid ||
    requestedAmountKobo !== attempt.amountKobo ||
    requestedAmountKobo !== order.amountKobo ||
    transaction.currency !== order.currency ||
    order.currency !== 'NGN' ||
    (transaction.customer?.email !== undefined &&
      transaction.customer.email.toLowerCase() !== customerEmail)
  ) {
    const reason =
      !amountFieldsAreValid
        ? 'invalid_amount_or_fee_fields'
        : requestedAmountKobo !== attempt.amountKobo ||
            requestedAmountKobo !== order.amountKobo
        ? 'amount_mismatch'
        : transaction.currency !== order.currency || order.currency !== 'NGN'
          ? 'currency_mismatch'
          : transaction.metadata?.order_id !== undefined &&
              transaction.metadata.order_id !== orderId
            ? 'metadata_order_mismatch'
            : 'customer_email_mismatch';
    console.error('Paystack transaction verification rejected', {
      reason,
      transactionStatus: transaction.status,
      expectedAmountKobo: order.amountKobo,
      attemptAmountKobo: attempt.amountKobo,
      requestedAmountKobo,
      chargedAmountKobo: transaction.amount,
      feesKobo: transaction.fees ?? null,
    });
    return {
      httpStatus: 409,
      paymentStatus: 'FAILED',
      message: 'The payment details do not match this order. Contact support before retrying.',
      orderReference: order.orderReference || order.paystackReference,
    };
  }

  const transactionId = String(transaction.id);
  const update = await Order.updateOne(
    {
      _id: order._id,
      paymentStatus: { $ne: 'PAID' },
      'paymentAttempts.reference': reference,
    },
    {
      $set: {
        paymentStatus: 'PAID',
        paystackReference: reference,
        paystackTransactionId: transactionId,
        paidAt: new Date(),
        'paymentAttempts.$.status': 'PAID',
        'paymentAttempts.$.transactionId': transactionId,
      },
    }
  );

  if (update.modifiedCount === 0) {
    const currentOrder = await Order.findById(order._id).select(
      'paymentStatus paystackReference amountKobo currency'
    );
    if (
      currentOrder?.paymentStatus !== 'PAID' ||
      currentOrder.paystackReference !== reference
    ) {
      console.error('Paystack verified payment was not applied to order', {
        reason: update.matchedCount === 0 ? 'paid_status_update_no_match' : 'paid_status_conflict',
      });
      return {
        httpStatus: 409,
        paymentStatus: 'FAILED',
        message: 'This order could not be updated with the verified payment.',
        orderReference: order.orderReference || order.paystackReference,
      };
    }
  }

  if (update.modifiedCount === 1) {
    await sendOrderEmail('paid', {
      email: order.customer.email,
      customerName: order.customer.name,
      orderReference: order.orderReference || reference,
      items: order.items.map(
        (item: { name: string; size: number; quantity: number }) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
        })
      ),
      amountKobo: order.amountKobo,
      currency: order.currency,
    });
  }

  return {
    httpStatus: 200,
    paymentStatus: 'PAID',
    message: 'Payment verified.',
    orderReference: order.orderReference || order.paystackReference,
    amountKobo: order.amountKobo,
    currency: order.currency,
  };
}

export async function markPaystackPaymentFailed(
  reference: string
): Promise<void> {
  await connectDB();
  await Order.updateOne(
    {
      'paymentAttempts.reference': reference,
      paymentStatus: { $ne: 'PAID' },
    },
    {
      $set: {
        paymentStatus: 'FAILED',
        'paymentAttempts.$.status': 'FAILED',
      },
    }
  );
}
