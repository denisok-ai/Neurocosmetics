/**
 * @file middleware.ts
 * @description Next.js middleware — обновление сессии Supabase + RBAC
 * @dependencies lib/supabase/middleware
 * @created 2025-03-05
 */

import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
