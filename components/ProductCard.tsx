'use client';

import { Product } from '@/lib/mockData';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from '@/lib/cartContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const { addItem } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = () => {
    if (product.sizes.length > 0) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        size: product.sizes[0],
        quantity: 1,
        image: product.image,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link href={`/products/${product.id}`}>
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden mb-4"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-foreground text-background px-3 py-1 rounded-full text-xs font-bold">
              -{discount}%
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
            {product.category}
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {product.brand}
        </p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-foreground group-hover:text-muted-foreground transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-foreground text-foreground" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-lg font-bold text-foreground">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm line-through text-muted-foreground">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleQuickAdd}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 py-3 bg-foreground text-background rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
