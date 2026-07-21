'use client';

import { Product } from '@/lib/mockData';
import Image from 'next/image';
import { useState } from 'react';
import { Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { motion } from 'framer-motion';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.image,
    });
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      {/* Images */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-foreground text-background px-4 py-2 rounded-full font-bold">
              -{discount}%
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product.images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-foreground transition-all"
            >
              <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
            {product.brand}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-foreground text-foreground'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="space-y-2 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-foreground">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl line-through text-muted-foreground">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground">{product.description}</p>
        </div>

        {/* Specs */}
        <div className="space-y-3 pb-6 border-b border-border">
          <h3 className="font-semibold text-foreground">Product Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Material</p>
              <p className="font-medium text-foreground">{product.specs.material}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weight</p>
              <p className="font-medium text-foreground">{product.specs.weight}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comfort</p>
              <p className="font-medium text-foreground">{product.specs.comfort}</p>
            </div>
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <label className="block font-semibold text-foreground mb-4">
            Select Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {product.sizes.map((size) => (
              <motion.button
                key={size}
                onClick={() => setSelectedSize(size)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`py-3 rounded-lg font-medium transition-colors border-2 ${
                  selectedSize === size
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-secondary text-foreground border-border hover:border-foreground'
                }`}
              >
                {size}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block font-semibold text-foreground mb-4">Quantity</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center font-bold hover:bg-muted transition-colors"
            >
              −
            </button>
            <span className="text-xl font-bold w-12 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center font-bold hover:bg-muted transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleAddToCart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-foreground text-background rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
        >
          Add to Cart
        </motion.button>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-foreground flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-foreground">Free Shipping</p>
              <p className="text-sm text-muted-foreground">On orders over $100</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-foreground flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-foreground">Secure Checkout</p>
              <p className="text-sm text-muted-foreground">100% protected</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-foreground flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-foreground">Easy Returns</p>
              <p className="text-sm text-muted-foreground">30-day guarantee</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
