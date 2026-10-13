import mongoose from 'mongoose';

// Admin User Schema
const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: String,
  },
  { timestamps: true }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: Number,
    rating: {
      type: Number,
      default: 4.5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    category: String,
    image: String,
    images: [String],
    description: String,
    specs: {
      material: String,
      weight: String,
      comfort: String,
    },
    sizes: [Number],
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    name: { type: String, required: true },
    image: String,
    size: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitAmountKobo: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const paymentAttemptSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true },
    amountKobo: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['INITIALIZING', 'INITIALIZED', 'PENDING', 'PAID', 'FAILED', 'CANCELLED'],
      required: true,
    },
    transactionId: String,
  },
  { timestamps: true }
);

const trackingUpdateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      required: true,
    },
    message: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderReference: {
      type: String,
      immutable: true,
    },
    trackingTokenHash: { type: String, select: false },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
    },
    delivery: {
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    items: { type: [orderItemSchema], required: true },
    amountKobo: { type: Number, required: true, min: 1 },
    currency: { type: String, enum: ['NGN'], default: 'NGN', required: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'],
      default: 'PENDING',
      required: true,
    },
    paymentMethod: { type: String, enum: ['PAYSTACK'], default: 'PAYSTACK', required: true },
    paystackReference: String,
    paystackTransactionId: String,
    paymentAttempts: { type: [paymentAttemptSchema], default: [] },
    paidAt: Date,
    fulfillmentStatus: {
      type: String,
      enum: [
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PROCESSING',
      required: true,
    },
    shipping: {
      carrier: { type: String, maxlength: 120 },
      trackingNumber: { type: String, maxlength: 120 },
      trackingUrl: { type: String, maxlength: 2048 },
      estimatedDeliveryAt: Date,
      shippedAt: Date,
      deliveredAt: Date,
    },
    trackingUpdates: { type: [trackingUpdateSchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.index({ 'paymentAttempts.reference': 1 }, { unique: true });
orderSchema.index({ paystackTransactionId: 1 }, { unique: true, sparse: true });
orderSchema.index({ orderReference: 1 }, { unique: true, sparse: true });

const rateLimitSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    requests: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Admin =
  mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);
export const Order =
  mongoose.models.Order || mongoose.model('Order', orderSchema);
export const ApiRateLimit =
  mongoose.models.ApiRateLimit ||
  mongoose.model('ApiRateLimit', rateLimitSchema);
