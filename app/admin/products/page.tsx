'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency } from '@/lib/format';
import type { Category, ProductDetail } from '@/lib/types';

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  defaultImageUrl: string;
  sku: string;
  variantTitle: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
  shade: string;
  length: string;
  size: string;
  featured: boolean;
  active: boolean;
};

const INITIAL_FORM: ProductFormState = {
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  defaultImageUrl: '',
  sku: '',
  variantTitle: '',
  price: '',
  compareAtPrice: '',
  stockQuantity: '0',
  shade: '',
  length: '',
  size: '',
  featured: false,
  active: true,
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const productCountLabel = useMemo(() => {
    if (products.length === 0) return 'No live products yet';
    if (products.length === 1) return '1 live product';
    return `${products.length} live products`;
  }, [products.length]);

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          categoryId: form.categoryId,
          defaultImageUrl: form.defaultImageUrl,
          sku: form.sku,
          variantTitle: form.variantTitle,
          price: form.price,
          compareAtPrice: form.compareAtPrice === '' ? null : form.compareAtPrice,
          stockQuantity: form.stockQuantity,
          shade: form.shade,
          length: form.length,
          size: form.size,
          featured: form.featured,
          active: form.active,
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to create product.');

      if (json.product) {
        setProducts((current) => [json.product, ...current]);
      }
      setForm(INITIAL_FORM);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create product.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(productId: string) {
    setDeletingId(productId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to delete product.');
      setProducts((current) => current.filter((product) => product.id !== productId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete product.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#D4A847]">Catalog Control</p>
          <h1 className="mt-2 font-serif text-4xl text-[#F7E7C1]">Products</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">Create, review, and remove live storefront products with a tighter, production-ready workflow.</p>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-[#6d4a13]/40 bg-[#1a1108] px-4 py-2 text-sm text-white/70">
          {productCountLabel}
        </div>
      </div>

      {error && (
        <Glass level="medium" className="border border-red-500/20 p-4 text-sm text-red-300">
          {error}
        </Glass>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Glass level="medium" className="border border-[#6d4a13]/35 bg-[#1a1108] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(212,168,71,0.14)] text-[#F0D080]">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#F7E7C1]">Add Product</h2>
              <p className="text-sm text-white/55">Create one product with its first sellable variant.</p>
            </div>
          </div>

          <form className="mt-6 space-y-3" onSubmit={handleCreateProduct}>
            <input
              value={form.name}
              onChange={(event) => {
                const name = event.target.value;
                setForm((current) => ({
                  ...current,
                  name,
                  slug: current.slug === '' || current.slug === toSlug(current.name) ? toSlug(name) : current.slug,
                }));
              }}
              placeholder="Product name"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
              required
            />
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: toSlug(event.target.value) }))}
              placeholder="product-slug"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
              required
            />
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Short product description"
              className="min-h-28 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <select
              value={form.categoryId}
              onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-[#140d05] text-white">
                  {category.name}
                </option>
              ))}
            </select>
            <input
              value={form.defaultImageUrl}
              onChange={(event) => setForm((current) => ({ ...current, defaultImageUrl: event.target.value }))}
              placeholder="Image URL"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.variantTitle}
                onChange={(event) => setForm((current) => ({ ...current, variantTitle: event.target.value }))}
                placeholder="Variant title"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
                required
              />
              <input
                value={form.sku}
                onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value.toUpperCase() }))}
                placeholder="SKU"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
                required
              />
              <input
                value={form.compareAtPrice}
                onChange={(event) => setForm((current) => ({ ...current, compareAtPrice: event.target.value }))}
                placeholder="Compare-at"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                value={form.stockQuantity}
                onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))}
                placeholder="Stock"
                type="number"
                min="0"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
                required
              />
              <input
                value={form.shade}
                onChange={(event) => setForm((current) => ({ ...current, shade: event.target.value }))}
                placeholder="Shade"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />
              <input
                value={form.length}
                onChange={(event) => setForm((current) => ({ ...current, length: event.target.value }))}
                placeholder="Length"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
              />
            </div>
            <input
              value={form.size}
              onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))}
              placeholder="Size"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
            <div className="flex flex-wrap gap-3 pt-1 text-sm text-white/70">
              <label className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                />
                Active
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-[#D4A847] px-5 py-3 font-medium text-[#140d05] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving product...' : 'Create Product'}
            </button>
          </form>
        </Glass>

        <div className="space-y-4">
          {products.length > 0 ? (
            products.map((product) => {
              const stockTotal = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);

              return (
                <Glass key={product.id} level="medium" className="border border-[#6d4a13]/35 bg-[#1a1108] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/45">
                        <span>{product.categoryName ?? 'Uncategorized'}</span>
                        {product.featured && <span className="rounded-full bg-[rgba(212,168,71,0.14)] px-2 py-1 tracking-[0.18em] text-[#F0D080]">Featured</span>}
                      </div>
                      <h2 className="mt-3 font-serif text-3xl text-[#F7E7C1]">{product.name}</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">{product.description || 'No description yet.'}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/55">
                        <span className="rounded-full border border-white/10 px-3 py-1">{product.slug}</span>
                        <span className="rounded-full border border-white/10 px-3 py-1">{product.variants.length} variant{product.variants.length === 1 ? '' : 's'}</span>
                        <span className="rounded-full border border-white/10 px-3 py-1">{stockTotal} in stock</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-2 text-xs font-medium ${
                          product.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/8 text-white/55'
                        }`}
                      >
                        {product.active ? 'Live' : 'Hidden'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingId === product.id}
                        className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20 disabled:opacity-60"
                      >
                        <Trash2 size={15} />
                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
                    {product.variants.map((variant) => (
                      <div key={variant.id} className="rounded-3xl border border-white/8 bg-black/10 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-white">{variant.title}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">{variant.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#F0D080]">{formatCurrency(variant.price)}</p>
                            <p className="text-xs text-white/50">{variant.stockQuantity} in stock</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/55">
                          {variant.shade && <span className="rounded-full bg-white/5 px-3 py-1">Shade: {variant.shade}</span>}
                          {variant.length && <span className="rounded-full bg-white/5 px-3 py-1">Length: {variant.length}</span>}
                          {variant.size && <span className="rounded-full bg-white/5 px-3 py-1">Size: {variant.size}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Glass>
              );
            })
          ) : (
            <Glass level="medium" className="border border-dashed border-[#6d4a13]/45 bg-[#1a1108] p-10 text-center">
              <h2 className="font-serif text-3xl text-[#F7E7C1]">No products yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/60">
                Add the first live product from the panel on the left. Once you save it, it will appear here and become manageable from the admin.
              </p>
            </Glass>
          )}
        </div>
      </div>
    </div>
  );
}
