/**
 * @file route.ts
 * @description PATCH /api/orders/[id]/status — обновление статуса заказа (только admin/manager)
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

const VALID_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "manager") {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const body = (await req.json()) as { status?: string };
    const status = body.status;
    if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: `status должен быть одним из: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("id, status")
      .maybeSingle();

    if (error) {
      console.error("[api/orders/status] PATCH error:", error.message);
      return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    return NextResponse.json({ id: data.id, status: data.status });
  } catch (e) {
    console.error("[api/orders/status] PATCH", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
