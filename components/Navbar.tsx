'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { CartDrawer } from './CartDrawer';

export function Navbar() {
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold tracking-tighter text-foreground">
                MP4 Footwear
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/products"
                className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Collections
              </Link>
              <a
                href="#about"
                className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Contact
              </a>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors hidden sm:block">
                <Search className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-foreground text-background text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-border">
              <Link
                href="/products"
                className="block py-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/"
                className="block py-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Collections
              </Link>
              <a
                href="#about"
                className="block py-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                About
              </a>
              <a
                href="#contact"
                className="block py-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          )}
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
