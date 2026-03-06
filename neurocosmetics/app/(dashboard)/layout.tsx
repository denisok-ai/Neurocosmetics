/**
 * @file layout.tsx
 * @description Server layout для Dashboard — auth check + sidebar
 * @dependencies lib/supabase/server, components/layout/dashboard-sidebar
 * @created 2025-03-05
 */

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { isDebugMode, getDebugRoleFromCookies } from "@/lib/debug";
import type { UserRole } from "@/lib/types";

async function getCurrentUserRole(): Promise<UserRole> {
  if (isDebugMode()) {
    const cookieStore = await cookies();
    const debugRole = getDebugRoleFromCookies(cookieStore);
    if (debugRole) return debugRole as UserRole;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "user";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return (profile?.role as UserRole) ?? "user";
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (isDebugMode()) {
    const cookieStore = await cookies();
    if (getDebugRoleFromCookies(cookieStore)) {
      const userRole = await getCurrentUserRole();
      return (
        <div className="flex min-h-screen bg-[#FAFAFA] text-navy">
          <DashboardSidebar userRole={userRole} />
          <main className="ml-64 flex-1 overflow-auto p-8">{children}</main>
        </div>
      );
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const userRole = await getCurrentUserRole();

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-navy">
      <DashboardSidebar userRole={userRole} />
      <main className="ml-64 flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
