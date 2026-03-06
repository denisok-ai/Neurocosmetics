/**
 * @file route.ts
 * @description API заказов: POST — создание, GET — список заказов текущего пользователя
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { OrderItem } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const body = (await req.json()) as { items: Array<{ product_id: string; product_name: string; quantity: number; price: number }> };
    const items = body.items ?? [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    }

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderItems: OrderItem[] = items.map((i) => ({
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      price: i.price,
    }));

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total,
        items: orderItems,
      })
      .select("id, user_id, status, total, items, created_at")
      .single();

    if (error) {
      console.error("[api/orders] POST insert error:", error.message);
      return NextResponse.json({ error: "Ошибка создания заказа" }, { status: 500 });
    }

    const result = {
      id: order.id,
      user_id: order.user_id,
      status: order.status,
      total: Number(order.total),
      items: order.items as OrderItem[],
      created_at: order.created_at,
    };
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error("[api/orders] POST", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");
    const isManagerRequest = scope === "all";

    let query = supabase
      .from("orders")
      .select("id, user_id, status, total, items, created_at");

    if (isManagerRequest) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin" && profile?.role !== "manager") {
        return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
      }
      // RLS: admin/manager могут видеть все заказы
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data: rows, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("[api/orders] GET error:", error.message);
      return NextResponse.json({ error: "Ошибка загрузки заказов" }, { status: 500 });
    }

    const orders = (rows ?? []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      status: r.status,
      total: Number(r.total),
      items: r.items ?? [],
      created_at: r.created_at,
    }));
    return NextResponse.json(orders);
  } catch (e) {
    console.error("[api/orders] GET", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
