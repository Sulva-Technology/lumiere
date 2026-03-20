import Link from 'next/link';
import { Glass } from '@/components/ui/glass';

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Glass level="heavy" className="p-8 sm:p-12 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-accent)]">Orders</p>
        <h1 className="mt-4 font-serif text-4xl text-[#1A1008] dark:text-white sm:text-5xl">Track Your Order</h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--text-secondary)]">
          Customer-facing tracking lookup has not been added yet, but your order is still recorded in the backend and managed in the admin dashboard.
        </p>
        <p className="mt-4 text-[var(--text-secondary)]">
          For now, contact support with your order number and checkout email for a manual status update.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex rounded-full bg-[#8B6914] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 dark:bg-[#D4A847] dark:text-[#1A1008]"
        >
          Contact Support
        </Link>
      </Glass>
    </div>
  );
}
