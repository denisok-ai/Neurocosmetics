/**
 * @file page.tsx
 * @description Страница LLM Settings — Server Component с RoleGuard
 * @dependencies components/auth/role-guard, components/admin/llm-settings-form
 * @created 2025-03-05
 */

import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { LLMSettingsForm } from "@/components/admin/llm-settings-form";

export const metadata: Metadata = { title: "AI Настройки" };

export default function LLMSettingsPage() {
  return (
    <RoleGuard allowed={["admin"]}>
      <LLMSettingsForm />
    </RoleGuard>
  );
}
