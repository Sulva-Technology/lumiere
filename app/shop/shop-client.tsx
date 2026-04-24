'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency } from '@/lib/format';
import type { Category, ProductListItem } from '@/lib/types';

export function ShopClient({ initialCategory }: { initialCategory: string }) {
  const router = useRouter();
  const activeCategory = initialCategory;
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products?category=${encodeURIComponent(activeCategory)}`);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load products.');
        setProducts(json.products);
        setCategories(json.categories);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load products.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [activeCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-text-secondary">Makeup Essentials</p>
          <h1 className="mt-3 font-serif text-4xl text-heading-primary md:text-5xl">The Makeup Edit</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Explore our curated selection of premium makeup artistry tools and complexion essentials, designed for the modern creator.
          </p>

          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            <button
              onClick={() => router.push('/shop')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === 'all' ? 'bg-forest-950 text-white dark:bg-accent-gold dark:text-forest-950' : 'bg-black/5 text-text-secondary hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => router.push(`/shop?category=${encodeURIComponent(category.slug)}`)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category.slug ? 'bg-forest-950 text-white dark:bg-accent-gold dark:text-forest-950' : 'bg-black/5 text-text-secondary hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-3xl bg-black/5 dark:bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <Glass level="heavy" className="p-8 text-center">
          <p className="font-serif text-2xl text-heading-primary text-[#1A1008] dark:text-white">Collection unavailable</p>
          <p className="mt-2 text-text-secondary">{error}</p>
        </Glass>
      ) : products.length === 0 ? (
        <Glass level="heavy" className="p-8 text-center">
          <p className="font-serif text-2xl text-heading-primary text-[#1A1008] dark:text-white">No products in this category yet</p>
          <p className="mt-2 text-text-secondary">Try another category or come back as new beauty drops go live.</p>
        </Glass>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Glass level="medium" className="flex h-full flex-col overflow-hidden">
                <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden">
                  <Image
                    src={product.defaultImage ?? 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400&h=500'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">{product.categoryName ?? 'Collection'}</p>
                    <Link href={`/product/${product.slug}`} className="mt-2 block font-serif text-2xl text-heading-primary">
                      {product.name}
                    </Link>
                    <p className="mt-2 text-sm text-text-secondary">{product.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-accent-gold">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-text-secondary">{product.available ? 'In stock' : 'Sold out'}</p>
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="rounded-full bg-forest-950 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-accent-gold dark:text-forest-950"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              </Glass>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
