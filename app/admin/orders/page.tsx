'use client';

import { useEffect, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { AdminOrderRow } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/orders');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load orders.');
        setOrders(json.orders);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load orders.');
      }
    }

    void load();
  }, []);

  async function updateStatus(orderId: string, fulfillmentStatus: string) {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfillmentStatus }),
    });

    const json = await response.json();
    if (!response.ok) {
      setError(json.error ?? 'Unable to update order.');
      return;
    }

    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, fulfillmentStatus: json.order.fulfillment_status } : order))
    );
  }

  return (
    <Glass level="medium" className="overflow-hidden p-6">
      <h1 className="font-serif text-3xl text-[#1A1008] dark:text-[#F0D080]">Orders</h1>
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] dark:border-white/10">
              <th className="pb-3">Order</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Created</th>
              <th className="pb-3">Items</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-black/5 text-sm dark:border-white/5">
                <td className="py-4 font-medium text-[#1A1008] dark:text-white">{order.orderNumber}</td>
                <td className="py-4">
                  <p>{order.customerName}</p>
                  <p className="text-[var(--text-secondary)]">{order.email}</p>
                </td>
                <td className="py-4 text-[var(--text-secondary)]">{formatDateTime(order.createdAt)}</td>
                <td className="py-4">{order.itemsCount}</td>
                <td className="py-4 font-medium text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(order.total)}</td>
                <td className="py-4 uppercase tracking-[0.2em] text-[var(--text-secondary)]">{order.paymentStatus}</td>
                <td className="py-4">
                  <select
                    value={order.fulfillmentStatus}
                    onChange={(event) => updateStatus(order.id, event.target.value)}
                    className="rounded-full bg-white/40 px-4 py-2 text-sm outline-none dark:bg-black/40"
                  >
                    <option value="unfulfilled">Unfulfilled</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Glass>
  );
}
