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
        setFeatured(data.slice(0, 8));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="featured" className="w-full py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          Loading featured products...
        </div>
      </section>
    );
  }

  return (
    <section id="featured" className="w-full py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16"
        >
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
              Curated Selection
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Featured Collection
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors mt-4 md:mt-0"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
