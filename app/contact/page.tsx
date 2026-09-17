'use client';

import { FormEvent, useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { CartProvider } from '@/lib/cartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

function ContactContent() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <>
      <Navbar />
      <main className="w-full bg-background">
        <section className="border-b border-border bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground mb-5">
              We are here to help
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Get in touch.</h1>
            <p className="max-w-xl mt-7 text-lg leading-8 text-muted-foreground">
              Questions about sizing, an order, or finding the right pair? Send us a note
              and the MP4 team will get back to you.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-16 lg:gap-28">
            <div>
              <h2 className="text-2xl font-bold">Contact details</h2>
              <div className="mt-8 space-y-7">
                <a href="tel:+2349057769271" className="flex items-start gap-4 group">
                  <Phone className="w-5 h-5 mt-1 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="block text-sm text-muted-foreground mb-1">Call us</span>
                    <span className="group-hover:underline">+234 905 776 9271</span>
                  </span>
                </a>
                <a href="mailto:hello@mp4-footwear.com" className="flex items-start gap-4 group">
                  <Mail className="w-5 h-5 mt-1 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="block text-sm text-muted-foreground mb-1">Email us</span>
                    <span className="group-hover:underline">hello@mp4-footwear.com</span>
                  </span>
                </a>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 mt-1 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="block text-sm text-muted-foreground mb-1">Visit us</span>
                    Asaba, Nigeria
                  </span>
                </div>
              </div>
              <div className="border-t border-border mt-12 pt-7 text-sm text-muted-foreground leading-6">
                Our team is available Monday to Saturday, 9:00 AM to 5:00 PM.
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold">Send a message</h2>
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Name</span>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Email</span>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30"
                    />
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Subject</span>
                  <input
                    name="subject"
                    type="text"
                    required
                    className="w-full border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Message</span>
                  <textarea
                    name="message"
                    rows={6}
                    required
                    className="w-full resize-y border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-foreground/30"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 font-semibold hover:opacity-80 transition-opacity"
                >
                  Send message
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
                {sent && (
                  <p className="text-sm text-muted-foreground" role="status">
                    Thanks for reaching out. We will be in touch soon.
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function ContactPage() {
  return (
    <CartProvider>
      <ContactContent />
    </CartProvider>
  );
}