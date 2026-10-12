'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import { CartProvider, useCart } from '@/lib/cartContext';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

interface VerificationResult {
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';
  message: string;
  orderId?: string;
  amountKobo?: number;
}

function ConfirmationContent({ reference }: { reference: string }) {
  const { clearCart } = useCart();
  const clearCartRef = useRef(clearCart);
  clearCartRef.current = clearCart;
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [checkNumber, setCheckNumber] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    async function verifyPayment() {
      setIsVerifying(true);
      setError(null);
      setResult(null);
      if (!reference) {
        setError('No Paystack payment reference was provided.');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/payments/paystack/verify?reference=${encodeURIComponent(reference)}`,
          { cache: 'no-store' }
        );
        const body = (await response.json()) as Partial<VerificationResult> & {
          error?: string;
        };
        if (!isCurrent) return;

        if (body.paymentStatus) {
          const verifiedResult = body as VerificationResult;
          setResult(verifiedResult);
          if (verifiedResult.paymentStatus === 'PAID') clearCartRef.current();
        } else {
          setError(body.error || 'Unable to verify this payment right now.');
        }
      } catch {
        if (isCurrent) {
          setError('A network error prevented payment verification. Please check again.');
        }
      } finally {
        if (isCurrent) setIsVerifying(false);
      }
    }

    void verifyPayment();
    return () => {
      isCurrent = false;
    };
  }, [reference, checkNumber]);

  const paid = result?.paymentStatus === 'PAID';
  const pending =
    !error &&
    (isVerifying || !result || result.paymentStatus === 'PENDING');

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
            {isVerifying ? (
              <LoaderCircle className="h-8 w-8 animate-spin" aria-hidden="true" />
            ) : paid ? (
              <Check className="h-8 w-8" aria-hidden="true" />
            ) : (
              <CircleAlert className="h-8 w-8" aria-hidden="true" />
            )}
          </div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            {isVerifying ? 'Verifying payment' : paid ? 'Payment confirmed' : 'Payment not confirmed'}
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            {isVerifying
              ? 'Checking your payment.'
              : paid
                ? 'Thank you for your order.'
                : pending
                  ? 'Your payment is still pending.'
                  : 'We could not confirm your payment.'}
          </h1>
          <p className="mt-5 leading-7 text-muted-foreground">
            {isVerifying
              ? 'We are verifying the transaction directly with Paystack. Please keep this page open.'
              : result?.message || error}
          </p>
          {paid && result?.orderId && (
            <p className="mt-3 text-sm text-muted-foreground">
              Order reference: {result.orderId}
              {typeof result.amountKobo === 'number' &&
                ` · ₦${(result.amountKobo / 100).toFixed(2)}`}
            </p>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {!isVerifying && !paid && (
              <button
                type="button"
                onClick={() => setCheckNumber((current) => current + 1)}
                className="inline-flex justify-center bg-foreground px-6 py-3 font-semibold text-background hover:opacity-80 transition-opacity"
              >
                Check payment again
              </button>
            )}
            <Link
              href={paid ? '/products' : '/checkout'}
              className="inline-flex justify-center border border-border px-6 py-3 font-semibold hover:bg-secondary transition-colors"
            >
              {paid ? 'Continue shopping' : 'Return to checkout'}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PaymentConfirmation({ reference }: { reference: string }) {
  return (
    <CartProvider>
      <ConfirmationContent reference={reference} />
    </CartProvider>
  );
}
