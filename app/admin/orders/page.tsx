'use client';

import { useEffect, useState } from 'react';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { AdminOrderRow } from '@/lib/types';

function paymentTone(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-500/15 text-emerald-300';
    case 'failed':
      return 'bg-red-500/15 text-red-300';
    case 'cancelled':
      return 'bg-white/10 text-white/55';
    default:
      return 'bg-amber-500/15 text-amber-300';
  }
}

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
    <div className="space-y-5 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#D4A847]">Operations</p>
          <h1 className="mt-2 font-serif text-4xl text-[#F7E7C1]">Orders</h1>
          <p className="mt-2 text-sm text-white/60">Track payment state, customer details, and fulfillment progress in one clean queue.</p>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-[#6d4a13]/40 bg-[#1a1108] px-4 py-2 text-sm text-white/70">
          {orders.length} order{orders.length === 1 ? '' : 's'}
        </div>
      </div>

      {error && (
        <Glass level="medium" className="border border-red-500/20 p-4 text-sm text-red-300">
          {error}
        </Glass>
      )}

      <Glass level="medium" className="overflow-hidden border border-[#6d4a13]/35 bg-[#1a1108] p-0">
        <div className="hidden grid-cols-[1.2fr_1.9fr_1.35fr_0.55fr_0.85fr_0.9fr_1.1fr] gap-6 border-b border-[#6d4a13]/25 px-6 py-5 text-xs uppercase tracking-[0.24em] text-white/40 xl:grid">
          <span>Order</span>
          <span>Customer</span>
          <span>Created</span>
          <span>Items</span>
          <span>Total</span>
          <span>Payment</span>
          <span>Fulfillment</span>
        </div>

        {orders.length > 0 ? (
          <div>
            {orders.map((order) => (
              <div
                key={order.id}
                className="border-b border-[#6d4a13]/18 px-5 py-5 last:border-b-0 xl:grid xl:grid-cols-[1.2fr_1.9fr_1.35fr_0.55fr_0.85fr_0.9fr_1.1fr] xl:items-center xl:gap-6 xl:px-6"
              >
                <div className="mb-4 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Order</p>
                  <p className="mt-1 font-semibold text-white xl:mt-0">{order.orderNumber}</p>
                </div>

                <div className="mb-4 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Customer</p>
                  <p className="mt-1 text-lg text-white xl:mt-0">{order.customerName}</p>
                  <p className="mt-1 break-all text-sm text-white/50">{order.email}</p>
                </div>

                <div className="mb-4 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Created</p>
                  <p className="mt-1 text-sm text-white/70 xl:mt-0">{formatDateTime(order.createdAt)}</p>
                </div>

                <div className="mb-4 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Items</p>
                  <p className="mt-1 text-white xl:mt-0">{order.itemsCount}</p>
                </div>

                <div className="mb-4 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Total</p>
                  <p className="mt-1 font-semibold text-[#F0D080] xl:mt-0">{formatCurrency(order.total)}</p>
                </div>

                <div className="mb-4 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Payment</p>
                  <span className={`mt-1 inline-flex rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] xl:mt-0 ${paymentTone(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Fulfillment</p>
                  <select
                    value={order.fulfillmentStatus}
                    onChange={(event) => updateStatus(order.id, event.target.value)}
                    className="mt-1 w-full rounded-full border border-[#6d4a13]/50 bg-[#140d05] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#D4A847] xl:mt-0"
                  >
                    <option value="unfulfilled">Unfulfilled</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <h2 className="font-serif text-3xl text-[#F7E7C1]">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/60">Paid and pending checkouts will appear here as soon as customers begin placing orders.</p>
          </div>
        )}
      </Glass>
    </div>
  );
}
