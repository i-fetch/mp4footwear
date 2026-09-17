'use client';

import Link from 'next/link';
import { ArrowLeft, Check, LockKeyhole, Minus, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { CartProvider, useCart } from '@/lib/cartContext';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

function CheckoutContent() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    clearCart();
  };

  if (isSubmitted) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-20">
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
              <Check className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Order received</p>
            <h1 className="mt-3 text-4xl font-bold">Thank you for choosing MP4.</h1>
            <p className="mt-5 leading-7 text-muted-foreground">
              Your order request has been received. We will contact you shortly to confirm
              delivery details and payment.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex bg-foreground px-6 py-3 font-semibold text-background hover:opacity-80 transition-opacity"
            >
              Continue shopping
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Your cart is empty.</h1>
            <p className="mt-4 text-muted-foreground">Add a pair before starting checkout.</p>
            <Link
              href="/products"
              className="mt-8 inline-flex bg-foreground px-6 py-3 font-semibold text-background hover:opacity-80 transition-opacity"
            >
              Browse products
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-background px-4 py-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Continue shopping
          </Link>
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.8fr]">
            <section>
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Secure checkout</p>
              <h1 className="mt-3 text-4xl font-bold">Complete your order.</h1>
              <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                <fieldset className="space-y-5">
                  <legend className="text-xl font-bold">Contact information</legend>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">Full name</span>
                      <input name="name" required className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium">Email address</span>
                      <input name="email" type="email" required className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30" />
                    </label>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Phone number</span>
                    <input name="phone" type="tel" required className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30" />
                  </label>
                </fieldset>

                <fieldset className="space-y-5 border-t border-border pt-8">
                  <legend className="text-xl font-bold">Delivery details</legend>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Delivery address</span>
                    <textarea name="address" rows={4} required className="w-full resize-y border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">City</span>
                    <input name="city" required className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30" />
                  </label>
                </fieldset>

                <button type="submit" className="w-full bg-foreground px-6 py-4 font-semibold text-background hover:opacity-80 transition-opacity">
                  Place order
                </button>
              </form>
            </section>

            <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold">Order summary</h2>
              <div className="mt-6 divide-y divide-border">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-4 py-5 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Size {item.size} · ₦{item.price.toFixed(2)}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="p-1 hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="p-1 hover:bg-secondary"><Plus className="h-4 w-4" /></button>
                        <button type="button" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.productId, item.size)} className="ml-auto p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-5 text-lg font-bold">
                <span>Total</span>
                <span>₦{total.toFixed(2)}</span>
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Your details are kept private.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutContent />
    </CartProvider>
  );
}