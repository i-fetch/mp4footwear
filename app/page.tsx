'use client';

import { CartProvider } from '@/lib/cartContext';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { FeaturedProducts } from '@/components/FeaturedProducts';
// import { Testimonials } from '@/components/Testimonials';
import { Footer } from '@/components/Footer';
import { BadgeCheck, CreditCard, MapPin } from 'lucide-react';
import Link from 'next/link';

function HomeContent() {
  return (
    <>
      <Navbar />
      <main className="w-full">
        <Hero />
        <section className="store-values" aria-label="The MP4 difference">
          <div className="store-values__inner">
            <div className="store-values__item">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <div>
                <p>Rooted in Asaba</p>
                <span>Chosen with a local point of view</span>
              </div>
            </div>
            <div className="store-values__item">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              <div>
                <p>Considered pairs</p>
                <span>Comfort, character, and everyday wear</span>
              </div>
            </div>
            <div className="store-values__item">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              <div>
                <p>Protected checkout</p>
                <span>Secure payments with Paystack</span>
              </div>
            </div>
          </div>
        </section>
        <FeaturedProducts />
        <section className="home-story">
          <div className="home-story__inner">
            <p className="eyebrow">A better everyday</p>
            <h2>Good footwear changes the pace of a day.</h2>
            <Link href="/about" className="home-story__link">Get to know MP4 <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
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
