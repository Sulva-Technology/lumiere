'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency } from '@/lib/format';
import type { Category, ProductListItem } from '@/lib/types';

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? 'all';
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
          <h1 className="font-serif text-4xl md:text-5xl">The Collection</h1>
          <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">
            Live catalog data now powers the collection, including real pricing and inventory-aware product pages.
          </p>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
            <button
              onClick={() => router.push('/shop')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === 'all' ? 'bg-[#8B6914] text-white dark:bg-[#D4A847] dark:text-[#1A1008]' : 'glass-subtle'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => router.push(`/shop?category=${encodeURIComponent(category.slug)}`)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category.slug ? 'bg-[#8B6914] text-white dark:bg-[#D4A847] dark:text-[#1A1008]' : 'glass-subtle'
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
          <p className="font-serif text-2xl text-[#1A1008] dark:text-white">Collection unavailable</p>
          <p className="mt-2 text-[var(--text-secondary)]">{error}</p>
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
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">{product.categoryName ?? 'Collection'}</p>
                    <Link href={`/product/${product.slug}`} className="mt-2 block font-serif text-2xl text-[#1A1008] dark:text-white">
                      {product.name}
                    </Link>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{product.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{product.available ? 'In stock' : 'Sold out'}</p>
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="rounded-full bg-[#8B6914] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-[#D4A847] dark:text-[#1A1008]"
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
