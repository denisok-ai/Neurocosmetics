/**
 * @file route.ts
 * @description GET /api/audit — список записей аудита (только admin)
 * В режиме отладки возвращает сгенерированные тестовые записи без Supabase.
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuditLogsFromSupabase } from "@/lib/api/audit";
import { isDebugMode, getDebugRoleFromCookie } from "@/lib/debug";
import { generateTestAudit } from "@/lib/data/test-data";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const debugRole = getDebugRoleFromCookie(cookieHeader);
    if (isDebugMode() && debugRole === "admin") {
      const { searchParams } = new URL(req.url);
      const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);
      const list = generateTestAudit().slice(0, limit);
      return NextResponse.json(list);
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);
    const list = await getAuditLogsFromSupabase(supabase, limit);
    return NextResponse.json(list);
  } catch (e) {
    console.error("[api/audit] GET", e);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}
