'use client';

import { testimonials } from '@/lib/mockData';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function Testimonials() {
  return (
    <section className="w-full py-20 md:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
            What Our Customers Say
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Loved by Sneaker Enthusiasts
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background rounded-lg p-8 space-y-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-foreground text-foreground"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground text-lg">{testimonial.content}</p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
