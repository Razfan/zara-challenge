'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { ColorOption, StorageOption } from '@/lib/types';

export type CartItem = {
  lineId: string;
  productId: string;
  name: string;
  brand: string;
  imageUrl: string;
  color: Pick<ColorOption, 'name' | 'hexCode'>;
  storage: StorageOption;
};

export type CartState = {
  items: CartItem[];
  hydrated: boolean;
};

type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; lineId: string }
  | { type: 'HYDRATE'; items: CartItem[] };

const STORAGE_KEY = 'cart';

const initialState: CartState = { items: [], hydrated: false };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD':
      return { ...state, items: [...state.items, action.item] };
    case 'REMOVE':
      return { ...state, items: state.items.filter((item) => item.lineId !== action.lineId) };
    case 'HYDRATE':
      return { items: action.items, hydrated: true };
  }
}

function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export type Cart = {
  items: CartItem[];
  count: number;
  total: number;
  /** False until the persisted cart has been read, so an empty cart is never shown by mistake. */
  hydrated: boolean;
  add: (item: Omit<CartItem, 'lineId'>) => void;
  remove: (lineId: string) => void;
};

// Exported so tests can provide a `Cart` value directly, such as the transient
// `hydrated: false` state that resolves synchronously in jsdom.
export const CartContext = createContext<Cart | null>(null);

// Starts empty on both server and first client render, then loads the persisted
// cart in an effect so hydration never mismatches.
export function CartProvider({ children }: { children: ReactNode }) {
  const [{ items, hydrated }, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'HYDRATE', items: readStoredCart() });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable: the cart keeps working in memory.
    }
  }, [hydrated, items]);

  const add = useCallback((item: Omit<CartItem, 'lineId'>) => {
    dispatch({ type: 'ADD', item: { ...item, lineId: crypto.randomUUID() } });
  }, []);

  const remove = useCallback((lineId: string) => {
    dispatch({ type: 'REMOVE', lineId });
  }, []);

  const value = useMemo<Cart>(
    () => ({
      items,
      count: items.length,
      total: items.reduce((sum, item) => sum + item.storage.price, 0),
      hydrated,
      add,
      remove,
    }),
    [items, hydrated, add, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Cart {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
