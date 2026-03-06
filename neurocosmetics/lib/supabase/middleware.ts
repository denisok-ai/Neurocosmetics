/**
 * @file middleware.ts
 * @description Обновление Supabase-сессии + RBAC (проверка ролей для защищённых маршрутов)
 * @dependencies @supabase/ssr
 * @created 2025-03-05
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDebugMode, getDebugRoleFromCookie } from "@/lib/debug";
import { getRequiredRoles, hasRole } from "@/lib/rbac";
import type { UserRole } from "@/lib/types";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Режим отладки: cookie debug-role позволяет доступ к dashboard без Supabase
  if (isDebugMode() && pathname.startsWith("/dashboard")) {
    const cookieHeader = request.headers.get("cookie");
    const debugRole = getDebugRoleFromCookie(cookieHeader);
    if (debugRole) {
      const required = getRequiredRoles(pathname);
      if (required && !hasRole(debugRole as UserRole, required)) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
      return NextResponse.next({ request });
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Защита dashboard — неавторизованных отправляем на /login
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // RBAC: проверка роли для защищённых маршрутов
  if (user && pathname.startsWith("/dashboard")) {
    const required = getRequiredRoles(pathname);
    if (required) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = (profile?.role ?? "user") as UserRole;
      if (!hasRole(userRole, required)) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
