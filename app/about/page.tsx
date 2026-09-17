import Link from 'next/link';
import { ArrowRight, Compass, Heart, Sparkles } from 'lucide-react';
import { CartProvider } from '@/lib/cartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

function AboutContent() {
  return (
    <>
      <Navbar />
      <main className="w-full bg-background">
        <section className="border-b border-border bg-foreground text-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
            <p className="text-sm uppercase tracking-[0.28em] text-background/60 mb-6">
              The MP4 story
            </p>
            <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight">
              Made for the miles that become memories.
            </h1>
            <p className="max-w-2xl mt-8 text-lg md:text-xl leading-8 text-background/70">
              MP4 Footwear brings considered design and everyday performance together,
              creating premium pairs that feel as good in motion as they look at rest.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-24 items-start">
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                Why we exist
              </p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Better essentials, thoughtfully chosen.
              </h2>
              <p className="mt-8 text-lg leading-8 text-muted-foreground">
                We believe the right footwear should disappear into your day: supportive
                enough for a long route, distinctive enough to feel like yours, and made
                with the details that reward a closer look.
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                From our home in Asaba, we curate footwear for people who move with
                intention. Every collection is selected for its balance of comfort,
                character, and staying power.
              </p>
            </div>

            <div className="border-t border-border">
              <div className="grid grid-cols-[auto_1fr] gap-5 py-7 border-b border-border">
                <Compass className="w-6 h-6 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-lg">Purposeful design</h3>
                  <p className="mt-2 text-muted-foreground leading-7">
                    Clean silhouettes and useful performance, without the noise.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-5 py-7 border-b border-border">
                <Heart className="w-6 h-6 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-lg">Comfort that lasts</h3>
                  <p className="mt-2 text-muted-foreground leading-7">
                    Premium everyday pairs chosen to keep up with real routines.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-5 py-7">
                <Sparkles className="w-6 h-6 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-lg">A sharper standard</h3>
                  <p className="mt-2 text-muted-foreground leading-7">
                    Thoughtful details that make a familiar essential feel considered.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
                Find your next pair
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">Step into the collection.</h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 w-fit bg-foreground text-background px-6 py-3 font-semibold hover:opacity-80 transition-opacity"
            >
              Shop all products
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function AboutPage() {
  return (
    <CartProvider>
      <AboutContent />
    </CartProvider>
  );
}