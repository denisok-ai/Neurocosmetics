/**
 * @file page.tsx
 * @description Список B2B-лидов для менеджера/админа
 * @created 2025-03-06
 */

import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { LeadsContent } from "./leads-content";

export const metadata: Metadata = {
  title: "B2B заявки",
};

export default function ManagerLeadsPage() {
  return (
    <RoleGuard allowed={["manager", "admin"]}>
      <LeadsContent />
    </RoleGuard>
  );
}
