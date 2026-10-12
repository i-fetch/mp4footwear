import { NextRequest, NextResponse } from 'next/server';
import { isObjectIdOrHexString } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Order, Product } from '@/lib/models';
import {
  createPaystackReference,
  getPaystackSecret,
  initializePaystackTransaction,
  PaystackApiError,
} from '@/lib/paystack';

export const runtime = 'nodejs';

interface CheckoutItemInput {
  productId: string;
  size: number;
  quantity: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
}

function parseCheckoutItems(value: unknown): CheckoutItemInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) {
    return null;
  }

  const items: CheckoutItemInput[] = [];
  const uniqueLines = new Set<string>();
  for (const valueItem of value) {
    if (!isRecord(valueItem)) return null;
    const productId = valueItem.productId;
    const size = valueItem.size;
    const quantity = valueItem.quantity;
    if (
      typeof productId !== 'string' ||
      !isObjectIdOrHexString(productId) ||
      typeof size !== 'number' ||
      !Number.isFinite(size) ||
      typeof quantity !== 'number' ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return null;
    }

    const key = `${productId}:${size}`;
    if (uniqueLines.has(key)) return null;
    uniqueLines.add(key);
    items.push({ productId, size, quantity });
  }

  return items;
}

export async function POST(request: NextRequest) {
  if (!getPaystackSecret()) {
    return NextResponse.json(
      { error: 'Paystack payments are not configured on this server.' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (!isRecord(body) || !isRecord(body.customer) || !isRecord(body.delivery)) {
    return NextResponse.json({ error: 'Checkout information is incomplete.' }, { status: 400 });
  }

  const name = readText(body.customer.name, 120);
  const email = readText(body.customer.email, 254)?.toLowerCase() ?? null;
  const phone = readText(body.customer.phone, 30);
  const address = readText(body.delivery.address, 500);
  const city = readText(body.delivery.city, 120);
  const emailIsValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneIsValid = phone && /^[+\d][\d\s().-]{6,24}$/.test(phone);
  const items = parseCheckoutItems(body.items);

  if (
    !name ||
    !emailIsValid ||
    !phoneIsValid ||
    !address ||
    !city ||
    !items
  ) {
    return NextResponse.json(
      { error: 'Enter valid contact and delivery details and check your cart quantities.' },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await Product.find({ _id: { $in: productIds } })
      .select('_id name price image sizes inStock')
      .lean();
    const productsById = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    const orderItems = [];
    let amountKobo = 0;
    for (const item of items) {
      const product = productsById.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: 'One or more products in your cart are no longer available.' },
          { status: 400 }
        );
      }
      if (product.inStock === false) {
        return NextResponse.json(
          { error: `${product.name} is currently out of stock.` },
          { status: 409 }
        );
      }
      if (!Array.isArray(product.sizes) || !product.sizes.includes(item.size)) {
        return NextResponse.json(
          { error: `The selected size for ${product.name} is unavailable.` },
          { status: 400 }
        );
      }

      const unitAmountKobo = Math.round(product.price * 100);
      if (
        !Number.isSafeInteger(unitAmountKobo) ||
        unitAmountKobo < 1 ||
        Math.abs(product.price * 100 - unitAmountKobo) > 0.000001
      ) {
        return NextResponse.json(
          { error: `${product.name} has an invalid price. Please contact support.` },
          { status: 409 }
        );
      }
      amountKobo += unitAmountKobo * item.quantity;
      if (!Number.isSafeInteger(amountKobo)) {
        return NextResponse.json(
          { error: 'The order total is too large to process.' },
          { status: 400 }
        );
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        size: item.size,
        quantity: item.quantity,
        unitAmountKobo,
      });
    }

    const reference = createPaystackReference();
    const order = await Order.create({
      customer: { name, email, phone },
      delivery: { address, city },
      items: orderItems,
      amountKobo,
      currency: 'NGN',
      paymentStatus: 'PENDING',
      paymentMethod: 'PAYSTACK',
      paystackReference: reference,
      paymentAttempts: [
        { reference, amountKobo, status: 'INITIALIZING' },
      ],
    });

    try {
      const initialization = await initializePaystackTransaction({
        email,
        amountKobo,
        reference,
        callbackUrl: new URL('/checkout/confirmation', request.nextUrl.origin).toString(),
        orderId: order._id.toString(),
        customerName: name,
        phone,
      });
      const authorizationUrl = new URL(initialization.authorization_url);
      if (
        initialization.reference !== reference ||
        authorizationUrl.protocol !== 'https:' ||
        authorizationUrl.hostname !== 'checkout.paystack.com'
      ) {
        throw new PaystackApiError('Paystack returned invalid checkout details.');
      }

      await Order.updateOne(
        { _id: order._id, 'paymentAttempts.reference': reference },
        { $set: { 'paymentAttempts.$.status': 'INITIALIZED' } }
      );
      return NextResponse.json({
        authorizationUrl: authorizationUrl.toString(),
      });
    } catch (error) {
      await Order.updateOne(
        { _id: order._id, paymentStatus: { $ne: 'PAID' } },
        {
          $set: {
            paymentStatus: 'FAILED',
            'paymentAttempts.0.status': 'FAILED',
          },
        }
      );
      console.error('Paystack initialization error:', error);
      return NextResponse.json(
        { error: 'Unable to start payment with Paystack. Please try again.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Checkout initialization error:', error);
    return NextResponse.json(
      { error: 'Unable to create your order right now. Please try again.' },
      { status: 500 }
    );
  }
}
