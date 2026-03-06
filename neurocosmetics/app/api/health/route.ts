/**
 * @file route.ts
 * @description GET /api/health — health check для мониторинга (uptime, load balancer)
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "0.6.0",
  };

  // Опционально: проверка Supabase (не блокирует ответ)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supabaseUrl) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "HEAD",
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
        signal: AbortSignal.timeout(3000),
      });
      checks.supabase = res.ok ? "reachable" : `status_${res.status}`;
    } catch (e) {
      checks.supabase = "unreachable";
    }
  }

  return NextResponse.json(checks, {
    status: 200,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
