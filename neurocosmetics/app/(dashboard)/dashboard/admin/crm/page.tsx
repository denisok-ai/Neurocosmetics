/**
 * @file page.tsx
 * @description CRM — клиенты и история заказов (задача 4.2)
 * @created 2025-03-06
 */

import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { CrmContent } from "./crm-content";

export const metadata: Metadata = {
  title: "CRM",
};

export default function AdminCrmPage() {
  return (
    <RoleGuard allowed={["admin", "manager"]}>
      <CrmContent />
    </RoleGuard>
  );
}
