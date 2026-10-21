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
      <div className="store-announcement">
        <span>Crafted for the way you move</span>
        <span className="store-announcement__divider" />
        <span>Complimentary delivery on orders over ₦20,000</span>
      </div>
      <nav className="store-nav">
        <div className="store-nav__inner">
          <Link href="/" className="store-brand" aria-label="MP4 Footwear home">
            <span className="store-brand__mark">MP4</span>
            <span className="store-brand__name">FOOTWEAR</span>
          </Link>

          <div className="store-nav__links">
            <Link href="/products" className="store-nav__link">Shop</Link>
            <Link href="/" className="store-nav__link">Collections</Link>
            <Link href="/about" className="store-nav__link">About</Link>
            <Link href="/contact" className="store-nav__link">Contact</Link>
          </div>

          <div className="store-nav__actions">
            <Link href="/products" className="store-nav__icon" aria-label="Browse footwear">
              <Search className="h-4.5 w-4.5" />
            </Link>
            <Link href="/track-order" className="store-nav__track">Track order</Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="store-nav__icon store-nav__bag"
              aria-label={`Open shopping bag${cartCount ? `, ${cartCount} items` : ''}`}
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && <span className="store-nav__count">{cartCount}</span>}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="store-nav__icon store-nav__menu"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-4.5 w-4.5" />
              ) : (
                <Menu className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="store-nav__mobile-links">
            <Link href="/products" onClick={() => setIsMenuOpen(false)}>Shop the collection</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)}>Our story</Link>
            <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <Link href="/track-order" onClick={() => setIsMenuOpen(false)}>Track an order</Link>
          </div>
        )}
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
