/**
 * @file route.ts
 * @description POST /api/debug/login — установка debug-роли (только в dev/debug режиме)
 */

import { NextResponse } from "next/server";
import { isDebugMode } from "@/lib/debug";
import type { UserRole } from "@/lib/types";

const VALID_ROLES: UserRole[] = ["user", "b2b", "manager", "admin"];

export async function POST(req: Request) {
  if (!isDebugMode()) {
    return NextResponse.json({ error: "Debug mode disabled" }, { status: 403 });
  }

  const body = (await req.json()) as { role?: string };
  const role = body.role?.trim();
  if (!role || !VALID_ROLES.includes(role as UserRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set("debug-role", role, {
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
    httpOnly: false, // чтобы клиент мог читать при необходимости
    sameSite: "lax",
  });
  return res;
}
