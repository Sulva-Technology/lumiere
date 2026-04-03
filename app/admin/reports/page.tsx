'use client';

import { useEffect, useState } from 'react';

import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { PaymentRecord } from '@/lib/types';

export default function AdminReportsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-5 pb-10">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#D4A847]">Operations</p>
        <h1 className="mt-2 font-serif text-4xl text-[#F7E7C1]">Payments & Reconciliation</h1>
        <p className="mt-2 text-sm text-white/60">Track pending, paid, failed, cancelled, and expired payment records from one queue.</p>
      </div>

      {error && (
        <Glass level="medium" className="border border-red-500/20 p-4 text-sm text-red-300">
          {error}
        </Glass>
      )}

      <Glass level="medium" className="overflow-hidden border border-[#6d4a13]/35 bg-[#1a1108] p-0">
        <div className="hidden grid-cols-[1fr_0.9fr_0.8fr_0.8fr_1.2fr_1.2fr] gap-6 border-b border-[#6d4a13]/25 px-6 py-5 text-xs uppercase tracking-[0.24em] text-white/40 xl:grid">
          <span>Payment</span>
          <span>Target</span>
          <span>Status</span>
          <span>Amount</span>
          <span>Reference</span>
          <span>Updated</span>
        </div>

        {payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.id} className="border-b border-[#6d4a13]/18 px-5 py-5 last:border-b-0 xl:grid xl:grid-cols-[1fr_0.9fr_0.8fr_0.8fr_1.2fr_1.2fr] xl:items-center xl:gap-6 xl:px-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Payment</p>
                <p className="mt-1 break-all font-medium text-white xl:mt-0">{payment.id}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Target</p>
                <p className="mt-1 text-white/80 xl:mt-0">
                  {payment.orderId ? 'Order' : payment.bookingId ? 'Booking' : 'Reservation'}
                </p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Status</p>
                <p className="mt-1 text-white/80 xl:mt-0">{payment.status}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Amount</p>
                <p className="mt-1 font-medium text-[#F0D080] xl:mt-0">{formatCurrency(payment.amount)}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Reference</p>
                <p className="mt-1 break-all text-sm text-white/65 xl:mt-0">{payment.providerReference ?? payment.sessionReference ?? 'Pending assignment'}</p>
              </div>
              <div className="mt-4 xl:mt-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35 xl:hidden">Updated</p>
                <p className="mt-1 text-sm text-white/65 xl:mt-0">{formatDateTime(payment.updatedAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-16 text-center text-sm text-white/60">No payment records have been created yet.</div>
        )}
      </Glass>
    </div>
  );
}
