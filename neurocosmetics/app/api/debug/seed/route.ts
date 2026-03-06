/**
 * @file route.ts
 * @description POST /api/debug/seed — сидирование тестовыми данными в Supabase (только в dev/debug)
 * Без SUPABASE_SERVICE_ROLE_KEY возвращает сгенерированные данные без записи в БД.
 */

import { NextResponse } from "next/server";
import { isDebugMode } from "@/lib/debug";
import {
  generateTestOrders,
  generateTestLeads,
  generateTestAudit,
} from "@/lib/data/test-data";
import { getAdminClientOrNull } from "@/lib/supabase/admin";

export async function POST() {
  if (!isDebugMode()) {
    return NextResponse.json({ error: "Debug mode disabled" }, { status: 403 });
  }

  const orders = generateTestOrders();
  const leads = generateTestLeads();
  const audit = generateTestAudit();

  let seededLeads = 0;
  let seededAudit = 0;

  const supabase = getAdminClientOrNull();
  if (supabase) {
    try {
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
        seededLeads += 1;
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
        seededAudit += 1;
      }
    } catch (e) {
      console.error("[api/debug/seed]", e);
      return NextResponse.json(
        {
          ok: true,
          orders,
          seeded: { orders: orders.length, leads: seededLeads, audit: seededAudit },
          warning: "Часть данных не записана в БД (проверьте SUPABASE_SERVICE_ROLE_KEY и таблицы).",
        },
        { status: 200 }
      );
    }
  }
  // Без service role ключа заказы только возвращаем (без записи в БД), leads/audit = 0

  return NextResponse.json({
    ok: true,
    orders,
    seeded: { orders: orders.length, leads: seededLeads, audit: seededAudit },
  });
}
