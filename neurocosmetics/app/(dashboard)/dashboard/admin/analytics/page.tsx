/**
 * @file page.tsx
 * @description Админ-панель: аналитика продаж (задача 4.1)
 * @dependencies RoleGuard, useOrdersStore, formatPrice
 * @created 2025-03-06
 */

import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { AnalyticsContent } from "./analytics-content";

export const metadata: Metadata = {
  title: "Аналитика",
};

export default function AdminAnalyticsPage() {
  return (
    <RoleGuard allowed={["admin", "manager"]}>
      <AnalyticsContent />
    </RoleGuard>
  );
}
