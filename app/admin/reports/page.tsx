'use client';

import { useEffect, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency } from '@/lib/format';
import type { DashboardMetrics } from '@/lib/types';

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/dashboard');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load reports.');
        setMetrics(json.metrics);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load reports.');
      }
    }

    void load();
  }, []);

  if (error) {
    return <Glass level="heavy" className="p-8 text-center text-[var(--text-secondary)]">{error}</Glass>;
  }

  if (!metrics) {
    return <div className="h-72 animate-pulse rounded-3xl bg-black/5 dark:bg-white/5" />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Glass level="medium" className="p-6">
        <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Revenue Snapshot</h2>
        <p className="mt-6 font-serif text-5xl text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(metrics.totalRevenue)}</p>
        <p className="mt-3 text-[var(--text-secondary)]">Paid orders only, synced from Stripe webhook completions.</p>
      </Glass>
      <Glass level="medium" className="p-6">
        <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Order Volume</h2>
        <p className="mt-6 font-serif text-5xl text-[#8B6914] dark:text-[#F0D080]">{metrics.totalOrders}</p>
        <p className="mt-3 text-[var(--text-secondary)]">Total orders stored in Supabase.</p>
      </Glass>
      <Glass level="medium" className="p-6">
        <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Booking Load</h2>
        <p className="mt-6 font-serif text-5xl text-[#8B6914] dark:text-[#F0D080]">{metrics.activeBookings}</p>
        <p className="mt-3 text-[var(--text-secondary)]">Upcoming or active salon reservations.</p>
      </Glass>
    </div>
  );
}
