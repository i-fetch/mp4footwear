'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Star, Truck, Shield, RotateCcw, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { motion } from 'framer-motion';

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

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const galleryImages = Array.from(new Set([product.image, ...product.images].filter(Boolean)));
  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    const productId = product._id || product.id;
    if (!productId || !selectedSize) return;

    addItem({
      productId,
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
    <div className="product-detail">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="product-detail__gallery"
      >
        <div className="product-detail__image-frame">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className="product-detail__image object-contain"
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          {discount > 0 && (
            <div className="absolute left-4 top-4 bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
              -{discount}%
            </div>
          )}
        </div>
        {galleryImages.length > 1 && (
          <div className="product-detail__thumbnails">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`product-detail__thumbnail${activeImage === image ? ' is-active' : ''}`}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={activeImage === image}
              >
                <Image src={image} alt="" fill className="object-cover" sizes="100px" />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="product-detail__information"
      >
        <div>
          <p className="eyebrow">{product.brand} <span className="px-1">/</span> {product.category}</p>
          <h1 className="product-detail__title">{product.name}</h1>
          <div className="product-detail__rating">
            <div className="flex items-center gap-1" aria-label={`${product.rating} out of 5 stars`}>
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-3.5 w-3.5 ${index < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span>{product.rating}</span>
            <span className="text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          <div className="product-detail__price-row">
            <span className="product-detail__price">₦{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="product-detail__original-price">₦{product.originalPrice.toLocaleString()}</span>
            )}
            <span className={`product-detail__availability${product.inStock ? ' is-available' : ''}`}>
              {product.inStock ? 'In stock' : 'Sold out'}
            </span>
          </div>

          <p className="product-detail__description">{product.description}</p>
        </div>

        <div className="product-detail__specifications">
          <div>
            <span>Material</span>
            <strong>{product.specs.material}</strong>
          </div>
          <div>
            <span>Weight</span>
            <strong>{product.specs.weight}</strong>
          </div>
          <div>
            <span>Feel</span>
            <strong>{product.specs.comfort}</strong>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Select your size
            </label>
            <span className="text-xs text-muted-foreground">Standard fit</span>
          </div>
          <div className="product-detail__sizes">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`product-detail__size${selectedSize === size ? ' is-selected' : ''}`}
                aria-pressed={selectedSize === size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="product-detail__purchase">
          <div className="product-detail__quantity" aria-label="Quantity">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
              −
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">
              +
            </button>
          </div>
          <motion.button
            onClick={handleAddToCart}
            whileTap={{ scale: 0.98 }}
            disabled={!product.inStock || !selectedSize}
            className="product-detail__add disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {product.inStock ? 'Add to bag' : 'Currently unavailable'}
          </motion.button>
        </div>

        <div className="product-detail__service">
          <div><Truck className="h-4 w-4" aria-hidden="true" /><span>Complimentary delivery over ₦20,000</span></div>
          <div><Shield className="h-4 w-4" aria-hidden="true" /><span>Secure checkout</span></div>
          <div><RotateCcw className="h-4 w-4" aria-hidden="true" /><span>Easy order support</span></div>
        </div>
      </motion.div>
    </div>
  );
}
