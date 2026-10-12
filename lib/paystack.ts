import { randomBytes } from 'node:crypto';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/lib/models';

interface PaystackTransaction {
  id: number | string;
  reference: string;
  status: string;
  amount: number;
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
  constructor(message: string) {
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
    throw new PaystackApiError('Paystack is not configured.');
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
    throw new PaystackApiError('Could not connect to Paystack.');
  }

  let envelope: PaystackEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as PaystackEnvelope<T>;
  } catch {
    throw new PaystackApiError('Paystack returned an invalid response.');
  }

  if (!response.ok || !envelope.status || !envelope.data) {
    throw new PaystackApiError('Paystack could not process the request.');
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
  orderId?: string;
  amountKobo?: number;
  currency?: string;
};

export async function verifyAndApplyPaystackPayment(
  reference: string
): Promise<PaymentVerification> {
  if (!getPaystackSecret()) {
    throw new PaystackApiError('Paystack is not configured.');
  }

  await connectDB();
  const order = await Order.findOne({
    'paymentAttempts.reference': reference,
  });
  if (!order) {
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
      };
    }

    return {
      httpStatus: 200,
      paymentStatus: 'PAID',
      message: 'Payment verified.',
      orderId,
      amountKobo: order.amountKobo,
      currency: order.currency,
    };
  }

  const transaction = await verifyPaystackTransaction(reference);
  if (transaction.reference !== reference) {
    return {
      httpStatus: 409,
      paymentStatus: 'FAILED',
      message: 'The transaction reference could not be verified.',
    };
  }

  if (transaction.status !== 'success') {
    const isFailed = transaction.status === 'failed';
    const isCancelled = transaction.status === 'abandoned';
    if (isFailed || isCancelled) {
      const paymentStatus = isCancelled ? 'CANCELLED' : 'FAILED';
      await Order.updateOne(
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
      return {
        httpStatus: 200,
        paymentStatus,
        message: isCancelled
          ? 'The payment was abandoned. You can return to checkout and try again.'
          : 'Paystack reported that this payment failed. You can try again at checkout.',
        orderId,
        amountKobo: order.amountKobo,
        currency: order.currency,
      };
    }

    return {
      httpStatus: 200,
      paymentStatus: 'PENDING',
      message: 'Payment is not yet confirmed. Check again shortly.',
      orderId,
      amountKobo: order.amountKobo,
      currency: order.currency,
    };
  }

  const customerEmail = order.customer.email.toLowerCase();
  if (
    transaction.metadata?.order_id !== orderId ||
    transaction.amount !== attempt.amountKobo ||
    transaction.currency !== 'NGN' ||
    transaction.customer?.email?.toLowerCase() !== customerEmail
  ) {
    return {
      httpStatus: 409,
      paymentStatus: 'FAILED',
      message: 'The payment details do not match this order. Contact support before retrying.',
      orderId,
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
      return {
        httpStatus: 409,
        paymentStatus: 'FAILED',
        message: 'This order could not be updated with the verified payment.',
        orderId,
      };
    }
  }

  return {
    httpStatus: 200,
    paymentStatus: 'PAID',
    message: 'Payment verified.',
    orderId,
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
