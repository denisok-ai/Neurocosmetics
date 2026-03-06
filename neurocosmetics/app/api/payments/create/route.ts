/**
 * @file route.ts
 * @description POST /api/payments/create — создание платежа YooKassa (или mock)
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";
import { isYooKassaConfigured, getYooKassaConfig } from "@/lib/config/payments";
import type { YooKassaPayment } from "@/lib/api/payments";

const YOOKASSA_API = "https://api.yookassa.ru/v3/payments";

function createIdempotenceKey(): string {
  return `haee-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      order_id: string;
      amount: number;
      description: string;
      return_url: string;
    };

    const { order_id, amount, description, return_url } = body;
    if (!order_id || amount == null || !return_url) {
      return NextResponse.json(
        { error: "order_id, amount, return_url обязательны" },
        { status: 400 }
      );
    }

    if (isYooKassaConfigured()) {
      const { shopId, secretKey } = getYooKassaConfig();
      const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

      const res = await fetch(YOOKASSA_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
          "Idempotence-Key": createIdempotenceKey(),
        },
        body: JSON.stringify({
          amount: { value: amount.toFixed(2), currency: "RUB" },
          capture: true,
          confirmation: { type: "redirect", return_url },
          description: description || `Заказ ${order_id}`,
          metadata: { order_id },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[api/payments/create] YooKassa error:", data);
        return NextResponse.json(
          { error: data.description || "Ошибка YooKassa" },
          { status: res.status }
        );
      }

      const payment: YooKassaPayment = {
        id: data.id,
        status: data.status,
        amount: data.amount,
        description: data.description ?? "",
        confirmation: data.confirmation ?? null,
        metadata: data.metadata ?? { order_id },
        created_at: data.created_at,
        paid: data.paid ?? false,
      };

      return NextResponse.json(payment);
    }

    // Mock
    const paymentId = `2e5d5a26-${Date.now().toString(36)}-mock`;
    const mockPayment: YooKassaPayment = {
      id: paymentId,
      status: "pending",
      amount: { value: amount.toFixed(2), currency: "RUB" },
      description: description || `Заказ ${order_id}`,
      confirmation: {
        type: "redirect",
        confirmation_url: `${new URL(return_url).origin}/shop/checkout/confirm?payment_id=${paymentId}&order_id=${order_id}`,
      },
      metadata: { order_id },
      created_at: new Date().toISOString(),
      paid: false,
    };
    return NextResponse.json(mockPayment);
  } catch (e) {
    console.error("[api/payments/create]", e);
    return NextResponse.json({ error: "Ошибка создания платежа" }, { status: 500 });
  }
}
