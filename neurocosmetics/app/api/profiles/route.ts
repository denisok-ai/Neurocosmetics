/**
 * @file route.ts
 * @description GET — возвращает карту user_id -> full_name для переданных id (для отображения имён в CRM и заказах)
 * Требует авторизации.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");
  if (!idsParam?.trim()) {
    return NextResponse.json({});
  }
  const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) return NextResponse.json({});
  if (ids.length > 100) return NextResponse.json({ error: "Too many ids" }, { status: 400 });
  const { data: rows, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", ids);

  if (error) {
    return NextResponse.json({}, { status: 500 });
  }

  const map: Record<string, string> = {};
  for (const row of rows ?? []) {
    const r = row as { id: string; full_name: string | null };
    map[r.id] = r.full_name?.trim() || "";
  }
  return NextResponse.json(map);
}
