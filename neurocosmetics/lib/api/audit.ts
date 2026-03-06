/**
 * @file audit.ts
 * @description Audit Log — запись в Supabase audit_logs (через service role)
 * @created 2025-03-06
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface AuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Пишет запись аудита в Supabase audit_logs.
 * Использует admin-клиент для обхода RLS (policy INSERT WITH CHECK (true)).
 */
export async function logAuditToSupabase(
  supabase: SupabaseClient,
  params: {
    user_id?: string | null;
    action: string;
    entity_type: string;
    entity_id?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await supabase.from("audit_logs").insert({
    user_id: params.user_id ?? null,
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id ?? null,
    metadata: params.metadata ?? {},
  });
}

/**
 * Синхронная обёртка для logAudit — вызывает logAuditToSupabase с admin-клиентом.
 * Не блокирует при ошибке (Supabase недоступен).
 */
export function logAudit(params: {
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
}): void {
  import("@/lib/supabase/admin").then(({ getAdminClientOrNull }) => {
    const supabase = getAdminClientOrNull();
    if (supabase) {
      logAuditToSupabase(supabase, params).catch((e) =>
        console.error("[audit] logAuditToSupabase failed:", e)
      );
    }
  });
}

/**
 * Читает записи аудита из Supabase (только admin, RLS).
 */
export async function getAuditLogsFromSupabase(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  limit = 100
): Promise<AuditEntry[]> {
  const { data: rows, error } = await supabase
    .from("audit_logs")
    .select("id, user_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (rows ?? []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    action: r.action,
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    created_at: r.created_at,
  }));
}
