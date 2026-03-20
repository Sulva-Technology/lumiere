'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Glass } from '@/components/ui/glass';
import { useCart } from '@/components/cart-context';
import { formatCurrency } from '@/lib/format';

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const { items, subtotal, clearCart } = useCart();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = useMemo(() => (subtotal >= 400 ? 0 : 25), [subtotal]);
  const total = subtotal + shipping;
  const success = searchParams.get('success') === '1';

  useEffect(() => {
    if (success) {
      clearCart();
    }
  }, [clearCart, success]);

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          shippingAddress: {
            line1,
            line2,
            city,
            state,
            postalCode,
            country,
          },
          lines: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? 'Unable to start checkout.');

      window.location.href = json.checkoutUrl;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start checkout.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Glass level="heavy" className="p-10 text-center">
          <h1 className="font-serif text-4xl text-[#1A1008] dark:text-white">Order confirmed</h1>
          <p className="mt-4 text-[var(--text-secondary)]">Your payment completed successfully. We’ve recorded your order and will begin fulfillment shortly.</p>
          <Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#8B6914] px-6 py-3 font-medium text-white dark:bg-[#D4A847] dark:text-[#1A1008]">
            Continue Shopping
          </Link>
        </Glass>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.42fr]">
        <Glass level="heavy" className="p-6 sm:p-8">
          <h1 className="font-serif text-3xl text-[#1A1008] dark:text-white">Checkout</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Real Stripe Checkout starts from this form, and the server recalculates every line before payment.</p>

          <form className="mt-8 space-y-4" onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required placeholder="First name" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} required placeholder="Last name" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
            </div>
            <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" placeholder="Email" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
            <input value={line1} onChange={(event) => setLine1(event.target.value)} required placeholder="Address line 1" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
            <input value={line2} onChange={(event) => setLine2(event.target.value)} placeholder="Address line 2" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input value={city} onChange={(event) => setCity(event.target.value)} required placeholder="City" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
              <input value={state} onChange={(event) => setState(event.target.value)} placeholder="State" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
              <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} required placeholder="Postal code" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
            </div>
            <select value={country} onChange={(event) => setCountry(event.target.value)} className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none">
              <option value="US">United States</option>
            </select>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full rounded-full bg-[#8B6914] py-4 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-[#D4A847] dark:text-[#1A1008]"
            >
              {loading ? 'Redirecting to Stripe...' : `Continue to Stripe - ${formatCurrency(total)}`}
            </button>
          </form>
        </Glass>

        <Glass level="medium" className="h-fit p-6">
          <h2 className="font-serif text-2xl text-[#1A1008] dark:text-white">Order summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.variantId} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[#1A1008] dark:text-white">{item.productName}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{item.variantTitle} · Qty {item.quantity}</p>
                </div>
                <p className="font-medium text-[#8B6914] dark:text-[#F0D080]">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-black/10 pt-6 text-sm dark:border-white/10">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between font-serif text-xl text-[#1A1008] dark:text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </Glass>
      </div>
    </div>
  );
}
