/**
 * @file order-status.ts
 * @description Маппинг событий платёжного шлюза → статус заказа, обновление статуса в Supabase
 * @created 2025-03-06
 */

import type { OrderStatus } from "@/lib/types";
import { reportCriticalError } from "@/lib/api/monitoring";

/** События YooKassa webhook → статус заказа */
const PAYMENT_EVENT_TO_STATUS: Record<string, OrderStatus> = {
  "payment.succeeded": "paid",
  "payment.canceled": "cancelled",
  "refund.succeeded": "cancelled",
};

/**
 * Преобразует событие webhook YooKassa в статус заказа.
 * Возвращает null, если событие не меняет статус заказа.
 */
export function paymentEventToOrderStatus(event: string): OrderStatus | null {
  return PAYMENT_EVENT_TO_STATUS[event] ?? null;
}

/**
 * Обновляет статус заказа в Supabase (через admin client, обход RLS).
 * Возвращает true, если обновлена хотя бы одна строка.
 * Если заказ хранится только в Zustand (mock), строка не найдена — вернёт false.
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  try {
    const { getAdminClientOrNull } = await import("@/lib/supabase/admin");
    const supabase = getAdminClientOrNull();
    if (!supabase) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("id")
      .maybeSingle();
    if (error) {
      await reportCriticalError(new Error(error.message), {
        source: "order_status_update",
        details: { orderId, status, supabaseError: error.message },
      });
      return false;
    }
    return data != null;
  } catch (e) {
    await reportCriticalError(e, {
      source: "order_status_update",
      details: { orderId, status },
    });
    return false;
  }
}
