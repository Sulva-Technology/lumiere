'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { ActionIconButton } from '@/components/admin/action-icon-button';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { TruncatedText } from '@/components/admin/truncated-text';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { AdminOrderRow } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  async function resendEmail(orderId: string) {
    setEmailingId(orderId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/email`, {
        method: 'POST',
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to resend order email.');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Unable to resend order email.');
    } finally {
      setEmailingId(null);
    }
  }

  async function cancelOrder(order: AdminOrderRow) {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    setRemovingId(order.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to delete order.');

      setOrders((current) => current.filter((item) => item.id !== order.id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to delete order.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#9ab18f]">Operations</p>
          <h1 className="mt-2 font-serif text-4xl text-[#eef2ea]">Orders</h1>
          <p className="mt-2 text-sm text-[#d7e0d0]/75">Track payment state, customer details, and fulfillment progress in one clean queue.</p>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.12)] px-4 py-2 text-sm text-[#d7e0d0]/78">
          {orders.length} order{orders.length === 1 ? '' : 's'}
        </div>
      </div>

      {error && (
        <Glass level="medium" className="border border-red-500/20 p-4 text-sm text-red-300">
          {error}
        </Glass>
      )}

      <Glass level="medium" className="overflow-hidden border border-[rgba(154,177,143,0.16)] bg-[rgba(22,33,26,0.88)] p-0">
        <div className="hidden grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)_minmax(0,1fr)_minmax(56px,0.4fr)_minmax(90px,0.6fr)_minmax(0,1fr)_minmax(210px,1.05fr)] gap-5 border-b border-[rgba(154,177,143,0.14)] px-6 py-5 text-xs uppercase tracking-[0.24em] text-[#9ab18f]/65 xl:grid">
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
                className="border-b border-[rgba(154,177,143,0.12)] px-5 py-5 last:border-b-0 xl:grid xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)_minmax(0,1fr)_minmax(56px,0.4fr)_minmax(90px,0.6fr)_minmax(0,1fr)_minmax(210px,1.05fr)] xl:items-center xl:gap-5 xl:px-6"
              >
                <div className="mb-4 min-w-0 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/65 xl:hidden">Order</p>
                  <div className="mt-1 xl:mt-0">
                    <TruncatedText value={order.orderNumber} className="font-semibold text-[#eef2ea]" mono />
                  </div>
                </div>

                <div className="mb-4 min-w-0 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/65 xl:hidden">Customer</p>
                  <div className="mt-1 space-y-1 xl:mt-0">
                    <TruncatedText value={order.customerName} className="text-lg text-[#eef2ea]" />
                    <TruncatedText value={order.email} className="text-sm text-[#d7e0d0]/55" />
                  </div>
                </div>

                <div className="mb-4 min-w-0 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/65 xl:hidden">Created</p>
                  <p className="mt-1 text-sm text-[#d7e0d0]/72 xl:mt-0">{formatDateTime(order.createdAt)}</p>
                </div>

                <div className="mb-4 min-w-0 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/65 xl:hidden">Items</p>
                  <p className="mt-1 text-[#eef2ea] xl:mt-0">{order.itemsCount}</p>
                </div>

                <div className="mb-4 min-w-0 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/65 xl:hidden">Total</p>
                  <p className="mt-1 font-semibold text-[#d7e0d0] xl:mt-0">{formatCurrency(order.total)}</p>
                </div>

                <div className="mb-4 min-w-0 xl:mb-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/65 xl:hidden">Payment</p>
                  <div className="mt-1 space-y-2 xl:mt-0">
                    <AdminStatusBadge status={order.paymentStatus} />
                    <div className="min-w-0">
                      <TruncatedText value={order.paymentReference} className="text-xs text-[#d7e0d0]/48" mono />
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ab18f]/65 xl:hidden">Actions</p>
                  <div className="mt-1 rounded-3xl border border-[rgba(154,177,143,0.14)] bg-[rgba(12,21,16,0.42)] p-3 xl:mt-0">
                    <select
                      value={order.fulfillmentStatus}
                      onChange={(event) => updateStatus(order.id, event.target.value)}
                      className="w-full rounded-2xl border border-[rgba(154,177,143,0.16)] bg-[rgba(108,139,103,0.08)] px-4 py-3 text-sm text-[#eef2ea] outline-none transition-colors focus:border-[rgba(154,177,143,0.34)]"
                      title={order.fulfillmentStatus}
                    >
                      <option value="unfulfilled">Unfulfilled</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <div className="mt-3 flex items-center gap-2">
                      <ActionIconButton
                        title={order.paymentStatus === 'paid' ? 'Resend order email' : 'Only paid orders can resend confirmation emails'}
                        onClick={() => resendEmail(order.id)}
                        disabled={emailingId === order.id || order.paymentStatus !== 'paid'}
                      >
                        <Mail size={16} />
                      </ActionIconButton>
                      <ActionIconButton
                        title="Delete order"
                        onClick={() => cancelOrder(order)}
                        disabled={removingId === order.id}
                        variant="danger"
                      >
                        <Trash2 size={16} />
                      </ActionIconButton>
                    </div>
                  </div>
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
