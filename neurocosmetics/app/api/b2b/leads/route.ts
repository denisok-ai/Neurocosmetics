/**
 * @file route.ts
 * @description API B2B-лидов: POST — создание заявки (Supabase), GET — список (только admin/manager)
 * В режиме отладки GET возвращает сгенерированные тестовые лиды без Supabase.
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";
import { addB2BLeadToSupabase, getB2BLeadsFromSupabase } from "@/lib/api/b2b-leads";
import { logAudit } from "@/lib/api/audit";
import { createClient } from "@/lib/supabase/server";
import { isDebugMode, getDebugRoleFromCookie } from "@/lib/debug";
import { generateTestLeads } from "@/lib/data/test-data";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = (await req.json()) as {
      company?: string;
      contact_name?: string;
      email?: string;
      phone?: string;
      message?: string;
      source?: "b2b_form" | "b2b_chat";
    };
    const company = (body.company ?? "").trim();
    const contact_name = (body.contact_name ?? "").trim();
    const email = (body.email ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const message = (body.message ?? "").trim();
    const source = body.source === "b2b_chat" ? "b2b_chat" : "b2b_form";

    if (!email) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    const lead = await addB2BLeadToSupabase(
      supabase,
      { company, contact_name, email, phone, message },
      source
    );
    logAudit({
      action: "b2b_lead_created",
      entity_type: "b2b_lead",
      entity_id: lead.id,
      metadata: { company, email, source },
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (e) {
    console.error("[api/b2b/leads] POST", e);
    return NextResponse.json({ error: "Ошибка создания заявки" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const debugRole = getDebugRoleFromCookie(cookieHeader);
    if (isDebugMode() && (debugRole === "admin" || debugRole === "manager")) {
      const list = generateTestLeads();
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
    if (profile?.role !== "admin" && profile?.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const list = await getB2BLeadsFromSupabase(supabase);
    return NextResponse.json(list);
  } catch (e) {
    console.error("[api/b2b/leads] GET", e);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}
