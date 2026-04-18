'use client';

import { useEffect, useState } from 'react';

import { AdminStatusBadge } from '@/components/admin/status-badge';
import { TruncatedText } from '@/components/admin/truncated-text';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { DashboardMetrics } from '@/lib/types';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/dashboard');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load dashboard.');
        setMetrics(json.metrics);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.');
      }
    }

    void load();
  }, []);

  if (error) {
    return <Glass level="heavy" className="p-8 text-center text-[var(--text-secondary)]">{error}</Glass>;
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-3xl bg-black/5 dark:bg-white/5" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue) },
    { label: 'Total Orders', value: metrics.totalOrders.toString() },
    { label: 'Active Bookings', value: metrics.activeBookings.toString() },
    { label: 'Pending Payments', value: metrics.pendingPayments.toString() },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Glass key={card.label} level="medium" className="p-6">
            <p className="text-sm text-[var(--text-secondary)]">{card.label}</p>
            <p className="mt-3 font-serif text-3xl text-[#8B6914] dark:text-[#F0D080]">{card.value}</p>
          </Glass>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.8fr]">
        <Glass level="medium" className="p-6">
          <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Recent Orders</h2>
          <div className="mt-6 space-y-4">
            {metrics.recentOrders.length > 0 ? (
              metrics.recentOrders.map((order) => (
                <div key={order.id} className="flex items-start justify-between gap-4 rounded-2xl bg-white/10 p-4 dark:bg-black/10">
                  <div className="min-w-0 flex-1">
                    <TruncatedText value={order.orderNumber} className="font-medium text-[#1A1008] dark:text-white" mono />
                    <div className="mt-1 space-y-1">
                      <TruncatedText value={order.customerName} className="text-sm text-[var(--text-secondary)]" />
                      <TruncatedText value={order.email} className="text-xs text-[var(--text-secondary)]" />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="min-w-[96px] text-right">
                    <p className="font-medium text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(order.total)}</p>
                    <div className="mt-2 flex justify-end">
                      <AdminStatusBadge status={order.fulfillmentStatus} className="text-[10px]" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white/10 p-4 text-sm text-[var(--text-secondary)] dark:bg-black/10">No orders have been placed yet.</p>
            )}
          </div>
        </Glass>

        <Glass level="medium" className="p-6">
          <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Low Stock</h2>
          <div className="mt-6 space-y-4">
            {metrics.lowStockProducts.length > 0 ? (
              metrics.lowStockProducts.map((item) => (
                <div key={item.variantId}>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-medium text-[#1A1008] dark:text-white">{item.label}</span>
                    <span className="text-red-600 dark:text-red-400">{item.stockQuantity} left</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white/10 p-4 text-sm text-[var(--text-secondary)] dark:bg-black/10">Inventory looks healthy right now.</p>
            )}
          </div>
        </Glass>
      </div>
    </div>
  );
}
