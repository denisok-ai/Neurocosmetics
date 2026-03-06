/**
 * @file cart.ts
 * @description Zustand store для корзины с сохранением в localStorage
 * @dependencies zustand, zustand/middleware, lib/types
 * @created 2025-03-05
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "@/lib/types";

const CART_STORAGE_KEY = "haee-cart";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.product.id !== productId)
              : state.items.map((item) =>
                  item.product.id === productId ? { ...item, quantity } : item
                ),
        })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    { name: CART_STORAGE_KEY }
  )
);
