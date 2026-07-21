'use client';

import { CartProvider } from '@/lib/cartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductDetail } from '@/components/ProductDetail';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { products } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function ProductPageContent({ product }: { product: (typeof products)[0] }) {
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

async function PageWrapper({ params }: PageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <CartProvider>
      <ProductPageContent product={product} />
    </CartProvider>
  );
}

export default PageWrapper;
