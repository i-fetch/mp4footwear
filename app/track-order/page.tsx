import { Suspense } from 'react';
import { CartProvider } from '@/lib/cartContext';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import TrackOrderForm from './track-order-form';

export default function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  return (
    <CartProvider>
      <Navbar />
      <main className="min-h-[70vh] bg-background px-4 py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Order support
          </p>
          <h1 className="mt-3 text-4xl font-bold">Track your order.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            New orders require the private tracking code provided after checkout.
            For orders placed before tracking was added, enter the Paystack
            payment reference and the checkout email and phone number.
          </p>
          <Suspense fallback={<p className="mt-8">Loading order tracking…</p>}>
            <TrackOrderSearch searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </CartProvider>
  );
}

async function TrackOrderSearch({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const params = await searchParams;
  return <TrackOrderForm initialReference={params.reference || ''} />;
}
