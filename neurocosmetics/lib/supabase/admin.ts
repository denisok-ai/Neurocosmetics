/**
 * @file admin.ts
 * @description Supabase-клиент с service_role для серверных операций, обходящих RLS (webhook, cron).
 * Использовать только в API routes / Server Actions, никогда не экспортировать ключ на клиент.
 * @created 2025-03-06
 */

import { createClient } from "@supabase/supabase-js";

let adminClient: ReturnType<typeof createClient> | null = null;

/**
 * Возвращает Supabase-клиент с правами service_role (обход RLS) или null, если ключ не задан.
 * Использовать в webhook и других серверных сценариях, где допустимо отсутствие ключа.
 */
export function getAdminClientOrNull(): ReturnType<typeof createClient> | null {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.trim() || !key?.trim()) return null;
  adminClient = createClient(url, key, { auth: { persistSession: false } });
  return adminClient;
}

/**
 * Возвращает Supabase-клиент с правами service_role. Выбрасывает, если ключ не задан.
 */
export function createAdminClient() {
  const client = getAdminClientOrNull();
  if (!client) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) required for admin client"
    );
  }
  return client;
}
