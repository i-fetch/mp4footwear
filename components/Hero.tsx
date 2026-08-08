'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { products } from '@/lib/mockData';

export function Hero() {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [direction, setDirection] = useState(1);

  const currentProduct = products[currentProductIndex];

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setDirection(1);

      setCurrentProductIndex(
        (prev) => (prev + 1) % products.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate]);

  const nextProduct = () => {
    setAutoRotate(false);
    setDirection(1);

    setCurrentProductIndex(
      (prev) => (prev + 1) % products.length
    );
  };

  const prevProduct = () => {
    setAutoRotate(false);
    setDirection(-1);

    setCurrentProductIndex(
      (prev) => (prev - 1 + products.length) % products.length
    );
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '8%' : '-8%',
      opacity: 0,
      scale: 1.08,
      filter: 'blur(8px)',
    }),

    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },

    exit: (direction: number) => ({
      x: direction > 0 ? '-8%' : '8%',
      opacity: 0,
      scale: 0.98,
      filter: 'blur(5px)',
    }),
  };

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-black">

      {/* IMAGE SLIDES */}
      <AnimatePresence
        mode="wait"
        custom={direction}
      >
        <motion.div
          key={currentProduct.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Image */}

          <motion.img
            src={currentProduct.image}
            alt={currentProduct.name}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 5,
              ease: 'easeOut',
            }}
          />

          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

          {/* Extra side gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* PRODUCT INFORMATION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProduct.id}
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -15,
          }}
          transition={{
            duration: 0.6,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute bottom-10 left-8 md:left-16 z-20 pointer-events-none"
        >
          {/* Slide number */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{
              opacity: 1,
              letterSpacing: '0.3em',
            }}
            transition={{
              duration: 0.7,
              delay: 0.2,
            }}
            className="text-xs uppercase text-white/70 font-mono"
          >
            0{currentProductIndex + 1} / 0{products.length}
          </motion.p>

          {/* Product name */}
          <motion.h2
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-white mt-1"
          >
            {currentProduct.name}
          </motion.h2>
        </motion.div>
      </AnimatePresence>

      {/* CONTROLS */}
      <div className="absolute bottom-10 right-8 md:right-16 z-20 flex items-center gap-6">

        {/* Pagination Dots */}
        <div className="flex gap-2 items-center">
          {products.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setAutoRotate(false);

                setDirection(
                  idx > currentProductIndex ? 1 : -1
                );

                setCurrentProductIndex(idx);
              }}
              animate={{
                width: idx === currentProductIndex ? 32 : 12,
                opacity: idx === currentProductIndex ? 1 : 0.4,
              }}
              whileHover={{
                opacity: 0.8,
                scale: 1.1,
              }}
              transition={{
                duration: 0.3,
              }}
              className="h-1.5 rounded-full bg-white"
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex gap-2">

          <motion.button
            onClick={prevProduct}
            whileHover={{
              scale: 1.08,
              x: -2,
            }}
            whileTap={{
              scale: 0.92,
            }}
            className="p-3 rounded-full border border-white/30 bg-black/40 backdrop-blur-md hover:bg-white hover:text-black transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={nextProduct}
            whileHover={{
              scale: 1.08,
              x: 2,
            }}
            whileTap={{
              scale: 0.92,
            }}
            className="p-3 rounded-full border border-white/30 bg-black/40 backdrop-blur-md hover:bg-white hover:text-black transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

        </div>
      </div>
    </section>
  );
}