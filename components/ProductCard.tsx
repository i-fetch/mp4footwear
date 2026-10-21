'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/cartContext';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  images: string[];
  description: string;
  specs: {
    material: string;
    weight: string;
    comfort: string;
  };
  sizes: number[];
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const productId = product._id || product.id || '';
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = () => {
    if (product.sizes.length > 0) {
      addItem({
        productId,
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
      className="product-card group"
    >
      <div className="product-card__media mb-4">
        <Link href={`/products/${productId}`} className="product-card__visual">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="product-card__image object-cover"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
          />

          {discount > 0 && (
            <div className="absolute left-3 top-3 bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
              -{discount}%
            </div>
          )}

          <div className="product-card__category absolute right-3 top-3 px-3 py-1 text-[10px] font-medium uppercase tracking-wider">
            {product.category}
          </div>
        </Link>
        <button
          onClick={handleQuickAdd}
          disabled={!product.inStock || product.sizes.length === 0}
          className="product-card__quick-add disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          {product.inStock ? 'Quick add' : 'Sold out'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {product.brand} <span className="px-1 text-accent">/</span> {product.category}
            </p>
            <Link href={`/products/${productId}`} className="inline-flex items-center gap-1.5">
              <h3 className="font-serif text-[21px] leading-tight text-foreground transition-colors group-hover:text-accent">
                {product.name}
              </h3>
              <ArrowUpRight className="h-3.5 w-3.5 text-accent opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </Link>
          </div>
          <div className="shrink-0 pt-1 text-right">
            <span className="block text-sm font-semibold text-foreground">₦{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₦{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-accent text-accent" aria-hidden="true" />
          <span className="text-foreground">{product.rating}</span>
          <span>({product.reviews} reviews)</span>
        </div>
      </div>
    </motion.div>
  );
}
