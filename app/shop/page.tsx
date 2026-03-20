import { Suspense } from 'react';
import { ShopClient } from './shop-client';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = params.category ?? 'all';

  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><div className="h-[60vh] animate-pulse rounded-3xl bg-black/5 dark:bg-white/5" /></div>}>
      <ShopClient initialCategory={initialCategory} />
    </Suspense>
  );
}
