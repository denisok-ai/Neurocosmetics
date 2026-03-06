/**
 * @file route.ts
 * @description POST /api/debug/seed — сидирование тестовыми данными в Supabase (только в dev/debug)
 */

import { NextResponse } from "next/server";
import { isDebugMode } from "@/lib/debug";
import { generateTestLeads, generateTestAudit } from "@/lib/data/test-data";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  if (!isDebugMode()) {
    return NextResponse.json({ error: "Debug mode disabled" }, { status: 403 });
  }

  const leads = generateTestLeads();
  const audit = generateTestAudit();

  try {
    const supabase = createAdminClient();

    for (const lead of leads) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("b2b_leads").insert({
        company: lead.company || null,
        contact_name: lead.contact_name || null,
        email: lead.email,
        phone: lead.phone || null,
        message: lead.message || null,
        source: lead.source,
      });
    }

    for (const entry of audit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("audit_logs").insert({
        user_id: entry.user_id,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        metadata: entry.metadata,
      });
    }

    return NextResponse.json({
      ok: true,
      seeded: { leads: leads.length, audit: audit.length },
    });
  } catch (e) {
    console.error("[api/debug/seed]", e);
    return NextResponse.json({ error: "Ошибка сидирования" }, { status: 500 });
  }
}
