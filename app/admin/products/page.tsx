'use client';

import { useEffect, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency } from '@/lib/format';
import type { Category, ProductDetail } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/products');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load products.');
        setProducts(json.products);
        setCategories(json.categories);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load products.');
      }
    }

    void load();
  }, []);

  return (
    <div className="space-y-8">
      <Glass level="medium" className="p-6">
        <h1 className="font-serif text-3xl text-[#1A1008] dark:text-[#F0D080]">Products</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Live catalog data from Supabase, grouped by variants and inventory.</p>
        {categories.length > 0 && <p className="mt-2 text-sm text-[var(--text-secondary)]">{categories.length} categories active across hair and makeup.</p>}
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </Glass>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {products.length > 0 ? (
          products.map((product) => (
            <Glass key={product.id} level="medium" className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">{product.categoryName ?? 'Uncategorized'}</p>
                  <h2 className="mt-2 font-serif text-2xl text-[#1A1008] dark:text-white">{product.name}</h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{product.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${product.available ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/15 text-red-700 dark:text-red-400'}`}>
                  {product.available ? 'Active' : 'Out of stock'}
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between rounded-2xl bg-white/10 p-4 text-sm dark:bg-black/10">
                    <div>
                      <p className="font-medium text-[#1A1008] dark:text-white">{variant.title}</p>
                      <p className="text-[var(--text-secondary)]">{variant.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(variant.price)}</p>
                      <p className="text-[var(--text-secondary)]">{variant.stockQuantity} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          ))
        ) : (
          <Glass level="medium" className="p-6">
            <p className="text-sm text-[var(--text-secondary)]">No products are in the catalog yet. Seeded hair and makeup inventory will appear here once loaded.</p>
          </Glass>
        )}
      </div>
    </div>
  );
}
