'use client';

import { motion } from 'motion/react';
import { Glass } from '@/components/ui/glass';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

const headlineWords = "Elevate Your Crown.".split(" ");

export default function Home() {
  return (
    <div className="flex flex-col gap-24">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="relative w-full h-[72vh] min-h-[520px] sm:min-h-[600px] rounded-[32px] overflow-hidden">
          {/* Cinematic Image with Ken Burns effect */}
          <motion.div
            className="absolute inset-0 z-0"
            animate={{ scale: [1.0, 1.08, 1.0] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          >
            <Image
              src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=1920&h=1080"
              alt="Luxury Hair Model"
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Mode-appropriate gradient overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#F5F0EA]/90 via-transparent to-transparent dark:from-[#1A1008]/90" />

          {/* Centered Heavy Glass Panel */}
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
            <Glass level="heavy" className="max-w-3xl w-full p-6 sm:p-10 md:p-16 text-center flex flex-col items-center">
              <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-medium tracking-tight mb-5 sm:mb-6 flex flex-wrap justify-center gap-x-4">
                {headlineWords.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12 + 0.2, duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-8 sm:mb-10 max-w-xl"
              >
                Discover premium extensions, bespoke natural care, and elite stylist booking—all in one curated experience.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#8B6914] dark:bg-[#D4A847] text-white dark:text-[#1A1008] font-medium hover:opacity-90 transition-opacity shadow-lg"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/book"
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#8B6914] dark:border-[#D4A847] text-[var(--text-primary)] font-medium hover:bg-[#8B6914]/10 dark:hover:bg-[#D4A847]/10 transition-colors"
                >
                  Book a Stylist
                </Link>
              </motion.div>
            </Glass>
          </div>
        </div>
      </section>

      {/* Category Tiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex items-end justify-between mb-10"
        >
          <h2 className="font-serif text-3xl md:text-4xl">Curated Collections</h2>
          <Link href="/shop" className="hidden sm:flex items-center gap-2 text-sm font-medium text-[var(--text-accent)] hover:opacity-80 transition-opacity">
            View All <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Wigs & Extensions', img: '1519699047748-de8e457a634e' },
            { title: 'Natural Hair Care', img: '1580618672591-eb180b1a973f' },
            { title: 'Color & Treatments', img: '1600948836101-f9ffda59d250' },
          ].map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="group cursor-pointer"
            >
              <Glass level="medium" className="aspect-[4/5] relative flex flex-col justify-end p-6 group-hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src={`https://images.unsplash.com/photo-${cat.img}?auto=format&fit=crop&q=80&w=600&h=800`}
                  alt={cat.title}
                  fill
                  className="object-cover opacity-60 dark:opacity-40 group-hover:opacity-80 dark:group-hover:opacity-60 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="relative z-10">
                  <h3 className="font-serif text-2xl text-white mb-2">{cat.title}</h3>
                  <div className="w-0 h-px bg-white group-hover:w-full transition-all duration-500 ease-out" />
                </div>
              </Glass>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stylist Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-24">
        <Glass level="heavy" className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h2 className="font-serif text-3xl md:text-5xl">The Salon Experience, Elevated.</h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-md">
              Connect with top-tier stylists specializing in luxury extensions, silk presses, and bespoke color.
            </p>
            <div className="flex items-center gap-2 text-[var(--text-accent)]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={20} fill="currentColor" />
              ))}
              <span className="text-[var(--text-primary)] ml-2 text-sm font-medium">4.9/5 Average Rating</span>
            </div>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--text-primary)] text-[var(--bg-gradient-start)] font-medium hover:opacity-90 transition-opacity mt-4"
            >
              Meet Our Stylists <ArrowRight size={18} />
            </Link>
          </div>
          <div className="flex-1 relative w-full aspect-video rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800&h=600"
              alt="Salon Experience"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </Glass>
      </section>
    </div>
  );
}
