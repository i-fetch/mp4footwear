'use client';

import Link from 'next/link';
import { ArrowLeft, LockKeyhole, Minus, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { CartProvider, useCart } from '@/lib/cartContext';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

interface CheckoutProduct {
  _id: string;
  name: string;
  price: number;
  inStock?: boolean;
  sizes?: number[];
}

function CheckoutContent() {
  const { items, updateQuantity, removeItem } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [products, setProducts] = useState<Record<string, CheckoutProduct>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    async function loadCurrentProducts() {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Unable to load current product prices.');
        }
        const data = (await response.json()) as CheckoutProduct[];
        if (!Array.isArray(data)) {
          throw new Error('The product list could not be loaded.');
        }
        if (isCurrent) {
          setProducts(
            Object.fromEntries(
              data
                .filter((product) => typeof product._id === 'string')
                .map((product) => [product._id, product])
            )
          );
        }
      } catch (error) {
        if (isCurrent) {
          setProductsError(
            error instanceof Error
              ? error.message
              : 'Unable to load current product prices.'
          );
        }
      } finally {
        if (isCurrent) setIsLoadingProducts(false);
      }
    }

    void loadCurrentProducts();
    return () => {
      isCurrent = false;
    };
  }, []);

  const hasInvalidProduct = items.some((item) => {
    const product = products[item.productId];
    return (
      !product ||
      !Number.isFinite(product.price) ||
      product.price < 0 ||
      product.inStock === false ||
      !Array.isArray(product.sizes) ||
      !product.sizes.includes(item.size)
    );
  });
  const subtotal = items.reduce(
    (sum, item) => sum + (products[item.productId]?.price ?? 0) * item.quantity,
    0
  );
  const canSubmit =
    !isLoadingProducts && !productsError && !hasInvalidProduct && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setPaymentError(null);

    const formData = new FormData(event.currentTarget);
    const checkoutData = {
      customer: {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
      },
      delivery: {
        address: formData.get('address'),
        city: formData.get('city'),
      },
      items: items.map(({ productId, size, quantity }) => ({
        productId,
        size,
        quantity,
      })),
    };

    try {
      const response = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });
      const result = (await response.json()) as {
        authorizationUrl?: string;
        orderReference?: string;
        trackingCode?: string;
        paystackReference?: string;
        error?: string;
      };

      if (
        !response.ok ||
        !result.authorizationUrl ||
        !result.orderReference ||
        !result.trackingCode ||
        !result.paystackReference
      ) {
        throw new Error(result.error || 'Unable to start your payment. Please try again.');
      }

      const checkoutUrl = new URL(result.authorizationUrl);
      if (
        checkoutUrl.protocol !== 'https:' ||
        checkoutUrl.hostname !== 'checkout.paystack.com'
      ) {
        throw new Error('Paystack returned an invalid checkout link.');
      }
      sessionStorage.setItem(
        `mp4-order-tracking:${result.orderReference}`,
        result.trackingCode
      );
      sessionStorage.setItem(
        `mp4-payment-order:${result.paystackReference}`,
        result.orderReference
      );
      window.location.assign(checkoutUrl.toString());
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : 'A network error occurred. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

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
      <main className="checkout-page bg-background px-4 py-12 md:py-20">
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

                {(productsError || (!isLoadingProducts && hasInvalidProduct)) && (
                  <p role="alert" className="text-sm text-destructive">
                    {productsError ||
                      'A product in your cart is unavailable or its price has changed. Remove it or update your cart before paying.'}
                  </p>
                )}
                {paymentError && (
                  <p role="alert" className="text-sm text-destructive">
                    {paymentError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-foreground px-6 py-4 font-semibold text-background hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingProducts
                    ? 'Loading current prices…'
                    : isSubmitting
                      ? 'Preparing secure payment…'
                      : 'Pay with Paystack'}
                </button>
              </form>
            </section>

            <aside className="checkout-summary h-fit border border-border p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold">Order summary</h2>
              <div className="mt-6 divide-y divide-border">
                {items.map((item) => {
                  const product = products[item.productId];
                  const name = product?.name ?? item.name;
                  const price = product?.price ?? item.price;
                  return (
                    <div key={`${item.productId}-${item.size}`} className="flex gap-4 py-5 first:pt-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Size {item.size} · ₦{price.toFixed(2)}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button type="button" aria-label={`Decrease ${name} quantity`} onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="p-1 hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button type="button" aria-label={`Increase ${name} quantity`} onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="p-1 hover:bg-secondary"><Plus className="h-4 w-4" /></button>
                          <button type="button" aria-label={`Remove ${name}`} onClick={() => removeItem(item.productId, item.size)} className="ml-auto p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <p className="font-semibold">₦{(price * item.quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-5 text-lg font-bold">
                <span>Subtotal</span>
                <span>₦{subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>Delivery fee</span>
                <span>Not charged</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-lg font-bold">
                <span>Total</span>
                <span>₦{subtotal.toFixed(2)}</span>
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