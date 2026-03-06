/**
 * @file dashboard-sidebar.tsx
 * @description Sidebar для Dashboard (Client Component — pathname + signOut)
 * @dependencies lucide-react, lib/supabase/client
 * @created 2025-03-05
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  LogOut,
  ChevronLeft,
  FlaskConical,
  ShoppingBag,
  Package,
  User,
  Users,
  ClipboardList,
  Building2,
  BarChart3,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { hasMinRole } from "@/lib/rbac";
import type { UserRole } from "@/lib/types";

const sidebarLinks: { href: string; label: string; icon: typeof LayoutDashboard; minRole: UserRole }[] = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard, minRole: "user" },
  { href: "/dashboard/orders", label: "Мои заказы", icon: Package, minRole: "user" },
  { href: "/dashboard/manager", label: "Управление заказами", icon: ClipboardList, minRole: "manager" },
  { href: "/dashboard/manager/leads", label: "B2B заявки", icon: Building2, minRole: "manager" },
  { href: "/dashboard/profile", label: "Профиль", icon: User, minRole: "user" },
  { href: "/dashboard/admin/analytics", label: "Аналитика", icon: BarChart3, minRole: "manager" },
  { href: "/dashboard/admin/crm", label: "CRM", icon: Users, minRole: "manager" },
  { href: "/dashboard/admin/audit", label: "Журнал аудита", icon: FileText, minRole: "admin" },
  { href: "/dashboard/admin/llm-settings", label: "AI Настройки", icon: Bot, minRole: "admin" },
  { href: "/shop", label: "Магазин", icon: ShoppingBag, minRole: "user" },
];

interface DashboardSidebarProps {
  userRole: UserRole;
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const visibleLinks = sidebarLinks.filter((link) => hasMinRole(userRole, link.minRole));

  async function handleSignOut() {
    // Очистка debug-режима (cookie)
    document.cookie = "debug-role=; path=/; max-age=0";
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/debug");
    router.refresh();
  }

  return (
    <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col shadow-[2px_0_12px_rgba(11,19,43,0.04)]">
      <div className="flex h-16 items-center gap-2 border-b border-navy/10 px-6">
        <FlaskConical className="h-5 w-5 text-gold" />
        <span className="font-serif text-lg font-bold text-navy">HAEE Portal</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleLinks.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === link.href ? "dashboard-sidebar-link-active" : "dashboard-sidebar-link"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-navy/10 p-3">
        <Link
          href="/"
          className="dashboard-sidebar-link flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          На сайт
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="dashboard-sidebar-link flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          Выход
        </button>
      </div>
    </aside>
  );
}
