'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { OrderItem } from '@/types/database';

interface CartContextValue {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'grabmoda-cart';

function loadStored(): OrderItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OrderItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStored(items: OrderItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);

  // Avoid hydration mismatch: server cannot read localStorage.
  // Load persisted cart only after the component mounts in browser.
  useEffect(() => {
    setItems(loadStored());
  }, []);

  const persist = useCallback((next: OrderItem[]) => {
    setItems(next);
    saveStored(next);
  }, []);

  const addItem = useCallback(
    (item: OrderItem) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product_id === item.product_id);
        let next: OrderItem[];
        if (existing) {
          next = prev.map((i) =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          next = [...prev, item];
        }
        saveStored(next);
        return next;
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.product_id !== productId);
      saveStored(next);
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const next = prev.filter((i) => i.product_id !== productId);
        saveStored(next);
        return next;
      }
      const next = prev.map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      );
      saveStored(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    saveStored([]);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, setQuantity, clearCart, total }),
    [items, addItem, removeItem, setQuantity, clearCart, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
