'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { Sparkles, Heart, ShieldCheck, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-serif text-[var(--text-primary)] leading-tight">
              Redefining <br/>
              <span className="italic text-[#8B6914] dark:text-[#D4A847]">Luxury</span> Hair Care
            </h1>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-md">
              Lumière was born from a simple belief: every individual deserves to experience the transformative power of truly premium hair extensions and natural care products.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] rounded-3xl overflow-hidden"
          >
            <Image 
              src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800&h=1200"
              alt="Luxury Salon Experience"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        </section>

        {/* Our Story */}
        <section className="relative">
          <div className="absolute inset-0 bg-[#8B6914]/5 dark:bg-[#D4A847]/5 rounded-3xl -z-10 transform -rotate-1" />
          <div className="bg-white/60 dark:bg-[rgba(26,16,8,0.8)] backdrop-blur-xl border border-[#c8a03c]/20 dark:border-[#d4a847]/15 rounded-3xl p-12 md:p-20 text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-serif text-[var(--text-primary)]">Our Story</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                Founded in 2020, Lumière began as a boutique studio dedicated to sourcing the finest, ethically-obtained raw hair. We noticed a gap in the market for extensions that not only looked flawless but maintained their integrity over time. Today, we&apos;ve grown into a comprehensive beauty destination, offering our signature collections alongside expert styling services and natural care products designed to nourish and protect.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                Our commitment remains unchanged: to provide an unparalleled experience of elegance, confidence, and radiant beauty.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-serif text-[var(--text-primary)]">Our Values</h2>
            <p className="text-[var(--text-secondary)]">The principles that guide everything we do.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: 'Uncompromising Quality', desc: 'We source only the highest grade, 100% raw human hair for our extensions.' },
              { icon: Heart, title: 'Ethical Sourcing', desc: 'Every product is obtained through transparent, fair-trade practices.' },
              { icon: ShieldCheck, title: 'Expert Craftsmanship', desc: 'Our stylists are master artisans, continuously trained in the latest techniques.' },
              { icon: Leaf, title: 'Natural Ingredients', desc: 'Our care line is formulated with pure, botanical ingredients free from harsh chemicals.' }
            ].map((value, i) => (
              <motion.div 
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/40 dark:bg-black/40 border border-[#c8a03c]/20 dark:border-[#d4a847]/15 space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#8B6914]/10 dark:bg-[#D4A847]/10 flex items-center justify-center text-[#8B6914] dark:text-[#D4A847]">
                  <value.icon size={24} />
                </div>
                <h3 className="text-xl font-serif text-[var(--text-primary)]">{value.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-8 pb-12">
          <h2 className="text-4xl font-serif text-[var(--text-primary)]">Experience Lumière</h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
            Ready to elevate your look? Explore our premium collections or book a consultation with one of our master stylists today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/shop"
              className="px-8 py-4 rounded-full bg-[#8B6914] dark:bg-[#D4A847] text-white dark:text-[#1A1008] font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
            >
              Shop Collections
            </Link>
            <Link 
              href="/book"
              className="px-8 py-4 rounded-full border border-[#8B6914] dark:border-[#D4A847] text-[#8B6914] dark:text-[#D4A847] font-medium hover:bg-[#8B6914]/5 dark:hover:bg-[#D4A847]/5 transition-colors w-full sm:w-auto"
            >
              Book a Stylist
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
