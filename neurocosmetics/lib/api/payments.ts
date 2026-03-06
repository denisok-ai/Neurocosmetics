/**
 * @file payments.ts
 * @description Mock-интеграция YooKassa с confirmation_url flow.
 * Конфиг шлюза: lib/config/payments.ts (isYooKassaConfigured, getYooKassaConfig).
 * @dependencies lib/types
 * @created 2025-03-05
 */

import type { OrderItem } from "@/lib/types";

export type PaymentStatus = "pending" | "waiting_for_capture" | "succeeded" | "canceled";

export interface YooKassaPayment {
  id: string;
  status: PaymentStatus;
  amount: { value: string; currency: "RUB" };
  description: string;
  confirmation: { type: "redirect"; confirmation_url: string } | null;
  metadata: { order_id: string };
  created_at: string;
  paid: boolean;
}

export interface CreatePaymentParams {
  order_id: string;
  amount: number;
  description: string;
  return_url: string;
}

/**
 * Создаёт платёж через API (реальный YooKassa или mock).
 */
export async function createPayment(params: CreatePaymentParams): Promise<YooKassaPayment> {
  const res = await fetch("/api/payments/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Ошибка создания платежа");
  }

  return res.json();
}

/**
 * Mock: подтверждение платежа (имитация capture после 3D Secure).
 * В реальности — POST /v3/payments/{id}/capture.
 */
export async function capturePayment(paymentId: string): Promise<YooKassaPayment> {
  await new Promise((r) => setTimeout(r, 800));

  return {
    id: paymentId,
    status: "succeeded",
    amount: { value: "0", currency: "RUB" },
    description: "",
    confirmation: null,
    metadata: { order_id: "" },
    created_at: new Date().toISOString(),
    paid: true,
  };
}

export function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("ru-RU") + " \u20BD";
}
