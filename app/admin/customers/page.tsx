'use client';

import { useEffect, useState } from 'react';

import { TruncatedText } from '@/components/admin/truncated-text';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { AdminCustomerRow } from '@/lib/types';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/customers');
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? 'Unable to load customers.');
        setCustomers(json.customers);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load customers.');
      }
    }

    void load();
  }, []);

  return (
    <Glass level="medium" className="overflow-hidden border border-[#6d4a13]/35 bg-[#1a1108] p-6 text-white">
      <h1 className="font-serif text-3xl text-[#F7E7C1]">Customers</h1>
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-left">
          <thead>
            <tr className="border-b border-[#6d4a13]/25 text-xs uppercase tracking-[0.2em] text-white/40">
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Phone</th>
              <th className="pb-3 pr-4">Orders</th>
              <th className="pb-3 pr-4">Bookings</th>
              <th className="pb-3 pr-4">Spent</th>
              <th className="pb-3">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-[#6d4a13]/18 text-sm last:border-0">
                  <td className="py-4 pr-4">
                    <div className="min-w-0 space-y-1">
                      <TruncatedText value={customer.name} className="font-medium text-white" />
                      <TruncatedText value={customer.email} className="text-white/50" />
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-white/60">
                    <TruncatedText value={customer.phone} className="text-white/60" />
                  </td>
                  <td className="py-4 pr-4 text-white/80">{customer.ordersCount}</td>
                  <td className="py-4 pr-4 text-white/80">{customer.bookingsCount}</td>
                  <td className="py-4 pr-4 font-medium text-[#F0D080]">{formatCurrency(customer.totalSpent)}</td>
                  <td className="py-4 text-white/60">{customer.lastActiveAt ? formatDateTime(customer.lastActiveAt) : '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-white/55">
                  Customer activity will appear here once orders or bookings start coming in.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Glass>
  );
}
