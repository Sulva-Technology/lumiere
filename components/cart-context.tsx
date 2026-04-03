'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface CartItem {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantTitle: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface AddCartItemInput extends Omit<CartItem, 'quantity'> {
  quantity?: number;
}

interface CartContextType {
  isOpen: boolean;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'itzlolabeauty-cart-v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextType>(
    () => ({
      isOpen,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (item) => {
        setItems((currentItems) => {
          const existing = currentItems.find((currentItem) => currentItem.variantId === item.variantId);

          if (existing) {
            return currentItems.map((currentItem) =>
              currentItem.variantId === item.variantId
                ? { ...currentItem, quantity: currentItem.quantity + (item.quantity ?? 1) }
                : currentItem
            );
          }

          return [
            ...currentItems,
            {
              ...item,
              quantity: item.quantity ?? 1,
            },
          ];
        });
        setIsOpen(true);
      },
      removeItem: (variantId) => setItems((currentItems) => currentItems.filter((item) => item.variantId !== variantId)),
      updateQuantity: (variantId, quantity) =>
        setItems((currentItems) =>
          currentItems.flatMap((item) => {
            if (item.variantId !== variantId) return [item];
            if (quantity <= 0) return [];
            return [{ ...item, quantity }];
          })
        ),
      clearCart: () => setItems([]),
    }),
    [isOpen, items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
