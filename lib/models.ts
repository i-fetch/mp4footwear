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

export const Admin =
  mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);
