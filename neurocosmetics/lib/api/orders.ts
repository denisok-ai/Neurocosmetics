/**
 * @file orders.ts
 * @description Zustand store заказов, данные из Supabase через API
 * @dependencies zustand, lib/types
 * @created 2025-03-05
 */

import { create } from "zustand";
import type { Order, OrderStatus } from "@/lib/types";

interface OrdersStore {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  /** scope: "mine" — заказы текущего пользователя, "all" — все (только admin/manager) */
  fetchOrders: (scope?: "mine" | "all") => Promise<void>;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  getOrder: (orderId: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],

  setOrders: (orders) => set({ orders }),

  fetchOrders: async (scope = "mine") => {
    try {
      const url = scope === "all" ? "/api/orders?scope=all" : "/api/orders";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        set({ orders: data });
      }
    } catch {
      // Ошибка сети или пользователь не авторизован — оставляем пустой массив
    }
  },

  updateStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    })),

  getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
}));
