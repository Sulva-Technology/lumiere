'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

import { ActionIconButton } from '@/components/admin/action-icon-button';
import { TruncatedText } from '@/components/admin/truncated-text';
import { Glass } from '@/components/ui/glass';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { AdminCustomerRow } from '@/lib/types';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  async function deleteCustomer(customer: AdminCustomerRow) {
    if (!window.confirm('Are you sure you want to delete this customer record?')) return;

    setRemovingId(customer.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to delete customer.');
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to delete customer.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Glass level="medium" className="overflow-hidden p-6">
      <h1 className="font-serif text-3xl text-[#4A2109]">Customers</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-left">
          <thead>
            <tr className="border-b border-black/5 text-xs uppercase tracking-[0.2em] text-[#8B4411]/75">
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Phone</th>
              <th className="pb-3 pr-4">Orders</th>
              <th className="pb-3 pr-4">Bookings</th>
              <th className="pb-3 pr-4">Spent</th>
              <th className="pb-3 pr-4">Last Active</th>
              <th className="pb-3 text-right">Delete</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-black/5 text-sm last:border-0">
                  <td className="py-4 pr-4">
                    <div className="min-w-0 space-y-1">
                      <TruncatedText value={customer.name} className="font-medium text-[#4A2109]" />
                      <TruncatedText value={customer.email} className="text-[var(--text-secondary)]" />
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-[var(--text-secondary)]">
                    <TruncatedText value={customer.phone} className="text-[var(--text-secondary)]" />
                  </td>
                  <td className="py-4 pr-4 text-[#4A2109]/85">{customer.ordersCount}</td>
                  <td className="py-4 pr-4 text-[#4A2109]/85">{customer.bookingsCount}</td>
                  <td className="py-4 pr-4 font-medium text-[#713813]">{formatCurrency(customer.totalSpent)}</td>
                  <td className="py-4 pr-4 text-[var(--text-secondary)]">{customer.lastActiveAt ? formatDateTime(customer.lastActiveAt) : '—'}</td>
                  <td className="py-4 text-right">
                    <ActionIconButton
                      title="Delete customer"
                      onClick={() => deleteCustomer(customer)}
                      disabled={removingId === customer.id}
                      variant="danger"
                      className="ml-auto"
                    >
                      <Trash2 size={16} />
                    </ActionIconButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-[var(--text-secondary)]">
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
