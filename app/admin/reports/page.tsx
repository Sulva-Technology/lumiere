'use client';

import { useEffect, useState } from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';

import { ActionIconButton } from '@/components/admin/action-icon-button';
import { AdminStatusBadge } from '@/components/admin/status-badge';
import { TruncatedText } from '@/components/admin/truncated-text';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { PaymentRecord } from '@/lib/types';

export default function AdminReportsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/payments');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load reconciliation data.');
        setPayments(json.payments);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load reconciliation data.');
      }
    }

    void load();
  }, []);

  async function deletePayment(payment: PaymentRecord) {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;

    setRemovingId(payment.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/payments/${payment.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to delete payment.');
      setPayments((current) => current.filter((item) => item.id !== payment.id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to delete payment.');
    } finally {
      setRemovingId(null);
    }
  }

  async function reconcilePayment(payment: PaymentRecord) {
    setReconcilingId(payment.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/payments/${payment.id}/reconcile`, { method: 'POST' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to reconcile payment.');

      if (json.payment) {
        setPayments((current) => current.map((item) => (item.id === payment.id ? json.payment : item)));
      }
    } catch (reconcileError) {
      setError(reconcileError instanceof Error ? reconcileError.message : 'Unable to reconcile payment.');
    } finally {
      setReconcilingId(null);
    }
  }

  return (
    <div className="space-y-5 pb-10">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#8B4411]">Operations</p>
        <h1 className="mt-2 font-serif text-4xl text-[#4A2109]">Payments & Reconciliation</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Track pending, paid, failed, cancelled, and expired payment records from one queue.</p>
      </div>

      {error && (
        <Glass level="medium" className="p-4 text-sm text-red-600">
          {error}
        </Glass>
      )}

      <Glass level="medium" className="overflow-hidden p-0">
        <div className="hidden grid-cols-[minmax(0,1.02fr)_minmax(0,0.8fr)_minmax(0,0.72fr)_minmax(90px,0.62fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_192px] gap-5 border-b border-black/5 px-6 py-5 text-xs uppercase tracking-[0.24em] text-[#8B4411]/75 xl:grid">
          <span>Payment</span>
          <span>Target</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Reference</span>
          <span>Updated</span>
          <span className="text-right">Actions</span>
        </div>

        {payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.id} className="border-b border-black/5 px-5 py-5 last:border-b-0 xl:grid xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.8fr)_minmax(0,0.72fr)_minmax(90px,0.62fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_192px] xl:items-center xl:gap-5 xl:px-6">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75 xl:hidden">Payment</p>
                <div className="mt-1 xl:mt-0">
                  <TruncatedText value={payment.id} className="font-medium text-[#4A2109]" mono />
                </div>
              </div>
              <div className="mt-4 min-w-0 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75 xl:hidden">Target</p>
                <div className="mt-1 space-y-1 xl:mt-0">
                  <p className="text-[#4A2109]/85">{payment.orderId ? 'Order' : payment.bookingId ? 'Booking' : 'Reservation'}</p>
                  <TruncatedText value={payment.orderId ?? payment.bookingId ?? payment.reservationId} className="text-xs text-[var(--text-secondary)]" mono />
                </div>
              </div>
              <div className="mt-4 min-w-0 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75 xl:hidden">Status</p>
                <div className="mt-1 xl:mt-0">
                  <AdminStatusBadge status={payment.status} />
                </div>
              </div>
              <div className="mt-4 min-w-0 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75 xl:hidden">Amount</p>
                <p className="mt-1 font-medium text-[#713813] xl:mt-0">{formatCurrency(payment.amount)}</p>
              </div>
              <div className="mt-4 min-w-0 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75 xl:hidden">Reference</p>
                <div className="mt-1 space-y-1 xl:mt-0">
                  <TruncatedText value={payment.providerReference} fallback="Pending assignment" className="text-sm text-[var(--text-secondary)]" mono />
                  {payment.sessionReference && payment.sessionReference !== payment.providerReference ? (
                    <TruncatedText value={`Session: ${payment.sessionReference}`} className="text-xs text-[var(--text-secondary)]/70" mono />
                  ) : null}
                </div>
              </div>
              <div className="mt-4 min-w-0 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#8B4411]/75 xl:hidden">Updated</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)] xl:mt-0">{formatDateTime(payment.updatedAt)}</p>
              </div>
              <div className="mt-4 flex justify-end gap-2 xl:mt-0">
                <ActionIconButton
                  title={payment.status === 'paid' ? 'Already confirmed' : 'Confirm payment'}
                  onClick={() => reconcilePayment(payment)}
                  disabled={reconcilingId === payment.id || payment.status === 'paid'}
                >
                  <CheckCheck size={16} />
                </ActionIconButton>
                <ActionIconButton
                  title="Delete payment record"
                  onClick={() => deletePayment(payment)}
                  disabled={removingId === payment.id}
                  variant="danger"
                >
                  <Trash2 size={16} />
                </ActionIconButton>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-16 text-center text-sm text-[var(--text-secondary)]">No payment records have been created yet.</div>
        )}
      </Glass>
    </div>
  );
}
