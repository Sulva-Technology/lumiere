'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useCart } from './cart-context';
import { X, Minus, Plus, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatCurrency } from '@/lib/format';

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, removeItem, updateQuantity } = useCart();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  const shippingThreshold = 400;
  const progress = Math.min((subtotal / shippingThreshold) * 100, 100);
  const amountLeft = Math.max(0, shippingThreshold - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-[#F5F0EA]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md"
          >
            <div className="flex h-full flex-col border-l border-[rgba(139,68,17,0.2)] bg-[rgba(247,247,242,0.95)] shadow-[-8px_0_32px_rgba(139,68,17,0.14)] backdrop-blur-[32px]">
              <div className="flex items-center justify-between border-b border-black/5 p-6">
                <h2 className="font-serif text-2xl text-[var(--text-primary)]">Your Bag</h2>
                <button onClick={closeCart} className="rounded-full bg-black/5 p-2 transition-colors hover:bg-black/10">
                  <X size={20} />
                </button>
              </div>

              <div className="border-b border-black/5 p-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {progress >= 100 ? "You've unlocked free shipping!" : `Add ${formatCurrency(amountLeft)} for free shipping`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-[#8B4411]"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[rgba(139,68,17,0.22)] p-8 text-center">
                    <p className="font-serif text-2xl text-[var(--text-primary)]">Your bag is empty</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">Add a few staples from the collection to get started.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4"
                      >
                        <div className="relative h-24 w-20 overflow-hidden rounded-xl bg-black/5">
                          <Image
                            src={item.imageUrl ?? 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=100&h=120'}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-sm font-medium leading-tight text-[var(--text-primary)]">{item.productName}</h3>
                                <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.variantTitle}</p>
                              </div>
                              <button
                                onClick={() => removeItem(item.variantId)}
                                className="rounded-full bg-black/5 p-1 text-[var(--text-secondary)] transition-colors hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="mt-2 font-medium text-[#8B4411]">{formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-black/5 px-2 py-1">
                            <button className="p-1" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                              <Minus size={12} />
                            </button>
                            <span className="w-4 text-center text-xs font-medium">{item.quantity}</span>
                            <button className="p-1" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div className="border-t border-black/5 bg-white/10 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-serif text-xl text-[var(--text-primary)]">Subtotal</span>
                  <span className="font-serif text-2xl text-[#8B4411]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8B4411] py-4 font-medium text-white shadow-lg transition-opacity hover:opacity-90"
                  >
                    Continue to Checkout <ArrowRight size={18} />
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full rounded-full border border-[rgba(139,68,17,0.28)] py-4 font-medium text-[#8B4411] transition-colors hover:bg-[rgba(139,68,17,0.06)]"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
