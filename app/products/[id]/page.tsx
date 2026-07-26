'use client';

import { CartProvider } from '@/lib/cartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductDetail } from '@/components/ProductDetail';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function ProductPageContent({ product }: { product: Product }) {
  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
            <Link href="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </div>

          {/* Product Detail */}
          <ProductDetail product={product} />

          {/* Related Products */}
          <div className="border-t border-border pt-20">
            <h2 className="text-3xl font-bold text-foreground mb-8">You Might Also Like</h2>
            <FeaturedProducts />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PageWrapper({ params }: PageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { id } = await params;
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          setError('Product not found');
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params]);

  if (loading) {
    return (
      <CartProvider>
        <Navbar />
        <main className="w-full min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </CartProvider>
    );
  }

  if (error || !product) {
    return (
      <CartProvider>
        <Navbar />
        <main className="w-full min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground text-center">
            <p>{error || 'Product not found'}</p>
            <Link href="/products" className="mt-4 text-blue-500 hover:text-blue-600">
              Back to products
            </Link>
          </div>
        </main>
        <Footer />
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <ProductPageContent product={product} />
    </CartProvider>
  );
}
