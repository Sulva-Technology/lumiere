'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Glass } from '@/components/ui/glass';
import { useCart } from '@/components/cart-context';
import { formatCurrency } from '@/lib/format';
import type { ProductDetail, ProductVariant } from '@/lib/types';

export function ProductPageClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${slug}`);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load product.');
        setProduct(json.product);
        setSelectedVariantId(json.product.variants[0]?.id ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load product.');
      } finally {
        setLoading(false);
      }
    }

    void loadProduct();
  }, [slug]);

  const selectedVariant = useMemo<ProductVariant | null>(
    () => product?.variants.find((variant) => variant.id === selectedVariantId) ?? product?.variants[0] ?? null,
    [product, selectedVariantId]
  );

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-8"><div className="h-[70vh] animate-pulse rounded-3xl bg-black/5 dark:bg-white/5" /></div>;
  }

  if (error || !product || !selectedVariant) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Glass level="heavy" className="p-10 text-center">
          <h1 className="font-serif text-3xl text-[#1A1008] dark:text-white">Product unavailable</h1>
          <p className="mt-3 text-[var(--text-secondary)]">{error ?? 'This product could not be found.'}</p>
        </Glass>
      </div>
    );
  }

  const canAddToCart = selectedVariant.stockQuantity > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <Glass level="heavy" className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={product.images[activeImage]?.url ?? product.defaultImage ?? 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=800&h=1000'}
              alt={product.images[activeImage]?.alt ?? product.name}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </Glass>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveImage(index)}
                className={`relative aspect-square overflow-hidden rounded-2xl ${activeImage === index ? 'ring-2 ring-[#8B6914] dark:ring-[#D4A847]' : 'opacity-70'}`}
              >
                <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Glass level="heavy" className="p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">{product.categoryName ?? 'Collection'}</p>
            <h1 className="mt-3 font-serif text-4xl text-[#1A1008] dark:text-white">{product.name}</h1>
            <p className="mt-4 text-3xl font-medium text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(selectedVariant.price)}</p>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">{product.description}</p>

            <div className="mt-8 space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)]">Choose an option</p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`rounded-full px-5 py-3 text-sm font-medium transition-colors ${
                      selectedVariant.id === variant.id
                        ? 'bg-[#8B6914] text-white dark:bg-[#D4A847] dark:text-[#1A1008]'
                        : 'bg-black/5 text-[var(--text-primary)] dark:bg-white/5'
                    }`}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                addItem({
                  variantId: selectedVariant.id,
                  productId: product.id,
                  productSlug: product.slug,
                  productName: product.name,
                  variantTitle: selectedVariant.title,
                  price: selectedVariant.price,
                  imageUrl: product.defaultImage,
                })
              }
              disabled={!canAddToCart}
              className="mt-8 w-full rounded-full bg-[#8B6914] py-4 text-lg font-medium text-white shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#D4A847] dark:text-[#1A1008]"
            >
              {canAddToCart ? 'Add to Cart' : 'Sold Out'}
            </button>
          </Glass>

          <div className="space-y-4">
            <Glass level="medium" className="p-6">
              <h2 className="font-serif text-xl text-[#1A1008] dark:text-white">Details & Benefits</h2>
              <ul className="mt-4 space-y-2 text-[var(--text-secondary)]">
                {product.details.length > 0 ? product.details.map((detail) => <li key={detail}>{detail}</li>) : <li>More product details coming soon.</li>}
              </ul>
            </Glass>
            <Glass level="medium" className="p-6">
              <h2 className="font-serif text-xl text-[#1A1008] dark:text-white">Usage & Care</h2>
              <ul className="mt-4 space-y-2 text-[var(--text-secondary)]">
                {product.careInstructions.length > 0 ? product.careInstructions.map((detail) => <li key={detail}>{detail}</li>) : <li>Usage guidance will be shared with your order.</li>}
              </ul>
            </Glass>
            <Glass level="medium" className="p-6">
              <h2 className="font-serif text-xl text-[#1A1008] dark:text-white">Shipping & Returns</h2>
              <ul className="mt-4 space-y-2 text-[var(--text-secondary)]">
                {product.shippingNotes.length > 0 ? product.shippingNotes.map((detail) => <li key={detail}>{detail}</li>) : <li>Shipping and return details will be confirmed at checkout.</li>}
              </ul>
            </Glass>
          </div>
        </div>
      </div>
    </div>
  );
}
