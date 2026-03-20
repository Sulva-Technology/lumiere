import { Suspense } from 'react';
import { CheckoutClient } from './checkout-client';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8"><div className="h-[60vh] animate-pulse rounded-3xl bg-black/5 dark:bg-white/5" /></div>}>
      <CheckoutClient />
    </Suspense>
  );
}
