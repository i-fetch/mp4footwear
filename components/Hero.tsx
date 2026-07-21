'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { products } from '@/lib/mockData';

export function Hero() {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const currentProduct = products[currentProductIndex];

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate]);

  const nextProduct = () => {
    setAutoRotate(false);
    setCurrentProductIndex((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setAutoRotate(false);
    setCurrentProductIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[1080px] overflow-hidden bg-black text-white">
      {/* Full-Width Image Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProduct.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={currentProduct.image}
            alt={currentProduct.name}
            className="w-full h-full object-cover object-center"
          />

          {/* Nike-style subtle dark gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Minimal Overlay Label */}
      <div className="absolute bottom-10 left-8 md:left-16 z-20 pointer-events-none">
        <p className="text-xs uppercase tracking-[0.3em] text-white/70 font-mono">
          0{currentProductIndex + 1} / 0{products.length}
        </p>
        <h2 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-white mt-1">
          {currentProduct.name}
        </h2>
      </div>

      {/* Nike-Style Floating Carousel Controls */}
      <div className="absolute bottom-10 right-8 md:right-16 z-20 flex items-center gap-6">
        {/* Pagination Dots */}
        <div className="flex gap-2 items-center">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAutoRotate(false);
                setCurrentProductIndex(idx);
              }}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                idx === currentProductIndex ? 'bg-white w-8' : 'bg-white/40 w-3 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex gap-2">
          <button
            onClick={prevProduct}
            className="p-3 rounded-full border border-white/30 bg-black/40 backdrop-blur-md hover:bg-white hover:text-black transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextProduct}
            className="p-3 rounded-full border border-white/30 bg-black/40 backdrop-blur-md hover:bg-white hover:text-black transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}