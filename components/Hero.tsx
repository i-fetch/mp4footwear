'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      setCurrentProductIndex((index) => (index + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate]);

  const goToProduct = (index: number) => {
    setAutoRotate(false);
    setDirection(index >= currentProductIndex ? 1 : -1);
    setCurrentProductIndex(index);
  };

  const moveProduct = (step: number) => {
    setAutoRotate(false);
    setDirection(step);
    setCurrentProductIndex((index) => (index + step + products.length) % products.length);
  };

  const slideVariants = {
    enter: (slideDirection: number) => ({
      x: slideDirection > 0 ? '4%' : '-4%',
      opacity: 0,
      scale: 1.04,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (slideDirection: number) => ({
      x: slideDirection > 0 ? '-4%' : '4%',
      opacity: 0,
      scale: 1.02,
    }),
  };

  return (
    <section className="editorial-hero" aria-labelledby="hero-title">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentProduct.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="editorial-hero__image"
        >
          <motion.img
            src={currentProduct.image}
            alt={currentProduct.name}
            className="editorial-hero__photo"
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: 4.8, ease: 'easeOut' }}
          />
          <div className="editorial-hero__shade" />
        </motion.div>
      </AnimatePresence>

      <div className="editorial-hero__content">
        <motion.div
          key={currentProduct.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="editorial-hero__copy"
        >
          <p className="editorial-hero__eyebrow">
            <span>MP4 Footwear</span>
            <span className="editorial-hero__separator" />
            The collection, 2026
          </p>
          <h1 id="hero-title" className="editorial-hero__title">
            The footwear
            <br />
            <span>edit.</span>
          </h1>
          <p className="editorial-hero__description">
            Distinctive pairs. Considered details. Find the one that moves with you.
          </p>
          <div className="editorial-hero__actions">
            <Link href="/products" className="editorial-hero__primary-link">
              Explore the collection
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/products" className="editorial-hero__text-link">
              Find your pair
            </Link>
          </div>
        </motion.div>

        <div className="editorial-hero__product-note">
          <span className="editorial-hero__product-index">
            0{currentProductIndex + 1} <span>/</span> 0{products.length}
          </span>
          <span className="editorial-hero__product-name">{currentProduct.name}</span>
          <span className="editorial-hero__product-category">{currentProduct.category}</span>
        </div>
      </div>

      <div className="editorial-hero__controls" role="group" aria-label="Featured products">
        <div className="editorial-hero__pagination">
          {products.map((product, index) => (
            <motion.button
              key={product.id}
              onClick={() => goToProduct(index)}
              animate={{
                width: index === currentProductIndex ? 30 : 12,
                opacity: index === currentProductIndex ? 1 : 0.42,
              }}
              transition={{ duration: 0.25 }}
              className="editorial-hero__dot"
              aria-label={`Show ${product.name}`}
              aria-current={index === currentProductIndex}
            />
          ))}
        </div>
        <div className="editorial-hero__arrows">
          <motion.button
            onClick={() => moveProduct(-1)}
            whileTap={{ scale: 0.94 }}
            className="editorial-hero__arrow"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={() => moveProduct(1)}
            whileTap={{ scale: 0.94 }}
            className="editorial-hero__arrow"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}

