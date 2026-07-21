'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="w-full bg-foreground text-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">MP4</h3>
            <p className="text-background/75">
              Premium palms crafted for excellence. Elevating style and performance since 2016.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Shop</h4>
            <div className="space-y-2 text-sm text-background/75">
              <Link
                href="/products"
                className="block hover:text-background transition-colors"
              >
                All Products
              </Link>
              <Link
                href="/products"
                className="block hover:text-background transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                href="/products"
                className="block hover:text-background transition-colors"
              >
                Best Sellers
              </Link>
              <Link
                href="/products"
                className="block hover:text-background transition-colors"
              >
                Sale
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold">Company</h4>
            <div className="space-y-2 text-sm text-background/75">
              <Link href="/" className="block hover:text-background transition-colors">
                About Us
              </Link>
              <Link href="/" className="block hover:text-background transition-colors">
                Contact
              </Link>
             
              <Link href="/" className="block hover:text-background transition-colors">
                Blog
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="space-y-3 text-sm text-background/75">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@mp4-footwear.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>New York, NY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-background/20 pt-12 mb-12">
          <div className="max-w-md">
            <h4 className="font-semibold mb-4">Subscribe to our newsletter</h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-background/10 rounded-lg text-background placeholder:text-background/50 outline-none focus:ring-2 focus:ring-background/50 transition-all"
                required
              />
              <button className="px-6 py-3 bg-background text-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-background/75">
          <p>&copy; 2026 MP4-FOOTWEAR. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/" className="hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-background transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/" className="hover:text-background transition-colors">
              Shipping Info
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
