'use client';

import { CartProvider } from '@/lib/cartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SiteLoader } from '@/components/SiteLoader';
import { Search } from 'lucide-react';

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

const categories = ['All', 'Handmade Footwear', 'Foreign Sandals', 'Handmade Sandal', 'Foreign footwears'];

function ProductsContent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [query, setQuery] = useState('');

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

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = allProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesQuery = !normalizedQuery ||
      `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

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

  if (loading) {
    return <SiteLoader message="Curating the collection" />;
  }

  return (
    <>
      <Navbar />
      <main className="catalog-page">
        <div className="catalog-shell">
          <header className="catalog-heading">
            <div>
              <p className="eyebrow">Footwear, considered</p>
              <h1 className="section-title">The collection.</h1>
              <p className="catalog-intro">Distinctive everyday pairs, chosen for comfort, craft, and character.</p>
            </div>
            <div className="catalog-tools">
              <label className="catalog-search">
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">Search products</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find your pair"
                />
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="catalog-sort"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </header>

          <div className="catalog-filters">
            <p className="catalog-filters__label">Browse by category</p>
            <div className="catalog-filters__list">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`catalog-filter${selectedCategory === category ? ' is-selected' : ''}`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="catalog-results">
            <p><span>{sorted.length}</span> pairs</p>
            <span>Prices in Nigerian naira</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-14 xl:grid-cols-4">
            {sorted.map((product, index) => (
              <ProductCard key={product._id || product.id} product={product} index={index} />
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="catalog-empty">
              <p className="font-serif text-3xl text-foreground">No pairs found.</p>
              <p className="mt-2 text-sm text-muted-foreground">Try another search or category.</p>
            </div>
          )}
        </div>
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
