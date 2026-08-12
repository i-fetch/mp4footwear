'use client';

import { CartProvider } from '@/lib/cartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

const categories = ['All', 'Performance', 'Classic', 'Running', 'Casual'];

function ProductsContent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else if (data && Array.isArray((data as any).products)) {
          setAllProducts((data as any).products);
        } else {
          console.error('Unexpected products response:', data);
          setAllProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setLoading(false);
      });
  }, []);

  const filtered = selectedCategory === 'All'
    ? allProducts
    : allProducts.filter((p) => p.category === selectedCategory);

  const safeFiltered = Array.isArray(filtered) ? filtered : [];
  const sorted = [...safeFiltered].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-background">
        {/* Loading State */}
        {loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center text-muted-foreground">
              Loading products...
            </div>
          </div>
        )}

        {/* Header */}
        {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                Discover
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                All Products
              </h1>
              <p className="text-lg text-muted-foreground mt-4">
                Browse our complete collection of premium palmss
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-secondary text-foreground rounded-lg border border-border outline-none focus:ring-2 focus:ring-foreground/50 transition-all"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-12 pb-8 border-b border-border">
            <p className="text-sm font-semibold text-foreground mb-4">Categories</p>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-foreground hover:bg-muted'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {sorted.map((product, index) => (
              <ProductCard key={product._id || product.id} product={product} index={index} />
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No products found in this category.
            </div>
          )}

          {/* Results Count */}
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Showing {sorted.length} of {allProducts.length} products
            </p>
          </div>
        </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function Page() {
  return (
    <CartProvider>
      <ProductsContent />
    </CartProvider>
  );
}
