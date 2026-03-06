/**
 * @file page.tsx
 * @description Управление заказами — только для manager и admin
 */

import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { ManagerContent } from "./manager-content";

export const metadata: Metadata = {
  title: "Управление заказами",
};

export default function ManagerDashboardPage() {
  return (
    <RoleGuard allowed={["manager", "admin"]}>
      <ManagerContent />
    </RoleGuard>
  );
}
