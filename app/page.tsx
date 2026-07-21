'use client';

import { CartProvider } from '@/lib/cartContext';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { FeaturedProducts } from '@/components/FeaturedProducts';
// import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';

function HomeContent() {
  return (
    <>
      <Navbar />
      <main className="w-full">
        <Hero />
        <FeaturedProducts />
        {/* <Testimonials /> */}
      </main>
      <Footer />
    </>
  );
}

export default function Page() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  );
}
