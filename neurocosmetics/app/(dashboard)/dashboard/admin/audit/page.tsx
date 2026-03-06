/**
 * @file page.tsx
 * @description Просмотр журнала аудита (задача 4.7)
 * @created 2025-03-06
 */

import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { AuditContent } from "./audit-content";

export const metadata: Metadata = {
  title: "Журнал аудита",
};

export default function AdminAuditPage() {
  return (
    <RoleGuard allowed={["admin"]}>
      <AuditContent />
    </RoleGuard>
  );
}
