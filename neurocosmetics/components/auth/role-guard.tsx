/**
 * @file role-guard.tsx
 * @description Server Component — показывает контент только для указанных ролей
 * @dependencies lib/supabase/server, lib/rbac
 * @created 2025-03-05
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/rbac";
import { isDebugMode, getDebugRoleFromCookies } from "@/lib/debug";
import type { UserRole } from "@/lib/types";

interface RoleGuardProps {
  allowed: UserRole[];
  fallbackUrl?: string;
  children: React.ReactNode;
}

export async function RoleGuard({ allowed, fallbackUrl = "/dashboard", children }: RoleGuardProps) {
  // Режим отладки: роль из cookie
  if (isDebugMode()) {
    const cookieStore = await cookies();
    const debugRole = getDebugRoleFromCookies(cookieStore);
    if (debugRole) {
      if (!hasRole(debugRole, allowed)) {
        redirect(fallbackUrl);
      }
      return <>{children}</>;
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = (profile?.role as UserRole) ?? "user";

  if (!hasRole(userRole, allowed)) {
    redirect(fallbackUrl);
  }

  return <>{children}</>;
}
