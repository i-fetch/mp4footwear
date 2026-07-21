'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Footprints } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden">
      {/* Background GIF of stars — place a `stars.gif` in `public/stars.gif` */}
      <img
        src="/stars.gif"
        alt="stars background"
        className="absolute inset-0 w-full h-full object-cover -z-20 opacity-100"
        aria-hidden
      />

      {/* Overlay for text readability */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-transparent to-black/30 backdrop-blur-sm" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground mb-4">
                <Footprints className="w-4 h-4 text-accent" />
                Hand-Stitched, Full-Grain Leather
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground text-balance">
                Built For The <span className="text-accent">Long Walk</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground max-w-lg text-balance"
            >
              Each pair is cut from full-grain hide and stitched to order — no synthetic soles, no shortcuts. Leather that gets better every time you wear it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Shop the Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#featured"
                className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                See the Craft
              </Link>
            </motion.div>

            {/* Stats — craft facts, not invented metrics. Swap in real numbers if you track them (e.g. pairs sold, repeat-customer rate). */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-border"
            >
              <div>
                <p className="text-2xl font-bold text-foreground">Full-Grain</p>
                <p className="text-sm text-muted-foreground">Leather, Not Synthetic</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Hand-Stitched</p>
                <p className="text-sm text-muted-foreground">Cut & Sewn To Order</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5-Year</p>
                <p className="text-sm text-muted-foreground">Sole Warranty</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Element — a hangtag placeholder standing in for real product photography.
              Swap the inner content for an <Image> of the actual sandal once you have shots. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative h-96 lg:h-full hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-muted rounded-2xl border border-border" />

            {/* Corner ticks, like the rivets on a leather tag */}
            <span className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-accent" />
            <span className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-accent" />
            <span className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-accent" />
            <span className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-accent" />

            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            >
              <Footprints className="w-10 h-10 text-accent" />
              <div className="text-5xl font-bold tracking-widest text-foreground/15 select-none">
                PALMS
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                No. 001 — Saddle Tan
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}