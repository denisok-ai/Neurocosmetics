/**
 * @file route.ts
 * @description POST /api/payments/confirm — подтверждение оплаты после возврата с YooKassa.
 * В mock/debug режиме обновляет заказ на paid. В production webhook делает это раньше.
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateOrderStatusInSupabase } from "@/lib/api/order-status";
import { isDebugMode } from "@/lib/debug";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");
    const paymentId = searchParams.get("payment_id");

    if (!orderId?.trim()) {
      return NextResponse.json({ error: "order_id обязателен" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .single();

    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ ok: true, status: "paid" });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ ok: true, status: order.status });
    }

    // В production статус обновляет webhook YooKassa. В mock/debug — обновляем здесь.
    if (!isDebugMode()) {
      return NextResponse.json({ ok: true, message: "Webhook обновит статус" });
    }

    const updated = await updateOrderStatusInSupabase(orderId, "paid");
    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    console.error("[api/payments/confirm]", e);
    return NextResponse.json({ error: "Ошибка подтверждения" }, { status: 500 });
  }
}
