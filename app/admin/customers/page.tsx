'use client';

import { useEffect, useState } from 'react';
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
    <Glass level="medium" className="overflow-hidden p-6">
      <h1 className="font-serif text-3xl text-[#1A1008] dark:text-[#F0D080]">Customers</h1>
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] dark:border-white/10">
              <th className="pb-3">Customer</th>
              <th className="pb-3">Phone</th>
              <th className="pb-3">Orders</th>
              <th className="pb-3">Bookings</th>
              <th className="pb-3">Spent</th>
              <th className="pb-3">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-black/5 text-sm dark:border-white/5">
                <td className="py-4">
                  <p className="font-medium text-[#1A1008] dark:text-white">{customer.name}</p>
                  <p className="text-[var(--text-secondary)]">{customer.email}</p>
                </td>
                <td className="py-4 text-[var(--text-secondary)]">{customer.phone ?? '—'}</td>
                <td className="py-4">{customer.ordersCount}</td>
                <td className="py-4">{customer.bookingsCount}</td>
                <td className="py-4 font-medium text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(customer.totalSpent)}</td>
                <td className="py-4 text-[var(--text-secondary)]">{customer.lastActiveAt ? formatDateTime(customer.lastActiveAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Glass>
  );
}
