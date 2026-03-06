/**
 * @file route.ts
 * @description GET /api/debug/status — проверка режима отладки (для диагностики)
 */

import { NextResponse } from "next/server";

export async function GET() {
  const debug =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEBUG_MODE === "true" ||
    process.env.DEBUG_MODE === "true";
  return NextResponse.json({
    debug,
    NODE_ENV: process.env.NODE_ENV,
    DEBUG_MODE: process.env.DEBUG_MODE ?? "(not set)",
    NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE ?? "(not set)",
  });
}
