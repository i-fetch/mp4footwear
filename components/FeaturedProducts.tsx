'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Product {
  _id: string;
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

export function FeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeatured(data.slice(0, 8));
        } else if (data && Array.isArray((data as any).products)) {
          setFeatured((data as any).products.slice(0, 8));
        } else {
          console.error('Unexpected products response:', data);
          setFeatured([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="featured-collection" aria-label="Loading featured footwear">
        <div className="featured-collection__inner">
          <div className="featured-collection__heading">
            <div>
              <p className="eyebrow">Selected for you</p>
              <h2 className="section-title">The latest edit.</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="product-skeleton">
                <div className="product-skeleton__image" />
                <div className="product-skeleton__line" />
                <div className="product-skeleton__line product-skeleton__line--short" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="featured-collection">
      <div className="featured-collection__inner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="featured-collection__heading"
        >
          <div>
            <p className="eyebrow">Selected for you</p>
            <h2 className="section-title">The latest edit.</h2>
          </div>
          <Link
            href="/products"
            className="featured-collection__all"
          >
            View the collection
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-14">
          {featured.map((product, index) => (
            <ProductCard key={product.id ?? (product as any)._id} product={product} index={index} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="border-y border-border py-12 text-center text-sm text-muted-foreground">
            New pairs are being added to the collection.
          </p>
        )}
      </div>
    </section>
  );
}
