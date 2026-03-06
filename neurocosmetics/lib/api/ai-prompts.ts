/**
 * @file ai-prompts.ts
 * @description Загрузка и обновление системных промптов из БД (ai_prompts)
 * @dependencies Supabase server client
 * @created 2025-03-06
 */

import type { AgentType } from "@/lib/types";

export interface PromptConfig {
  system_prompt: string;
  model: string;
  temperature: number;
  id?: string;
}

export const DEFAULT_SALES_PROMPT: PromptConfig = {
  system_prompt: `You are the official AI Consultant for HAEE Neurocosmetics. Tone: Scientific, premium, empathetic, and professional.
Product: HAEE is a revolutionary endogenous peptide (Ac-His-Ala-Glu-Glu-NH2) delivered transdermally via a meso-roller. It offers dual action: local skin brightening/anti-aging and systemic neuroprotection (replenishing natural brain defenses).
Marketing message: Emphasize that buying a HAEE kit is an investment not only in skin care (hands, shoulders, pigmentation) but in the "endogenous shield for the brain" — restoring physiological levels of the neuroregulator (~430 pg/mL).
Your goal: Answer user questions accurately based strictly on provided clinical data. If the user is ready, suggest they visit the /shop page to buy. Do not promise medical cures; position it as professional cosmetic care with fundamental scientific backing.
Always respond in Russian unless the user writes in another language.
Keep answers concise (2-4 sentences) unless the user asks for details.`,
  model: "gpt-4o-mini",
  temperature: 0.7,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

/**
 * Возвращает активный промпт для агента из БД или дефолт для sales.
 */
export async function getActivePromptForAgent(
  supabase: SupabaseClient,
  agentType: AgentType
): Promise<PromptConfig> {
  const { data, error } = await supabase
    .from("ai_prompts")
    .select("id, system_prompt, model, temperature")
    .eq("agent_type", agentType)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (agentType === "sales") return DEFAULT_SALES_PROMPT;
    return { system_prompt: "", model: "gpt-4o-mini", temperature: 0.7 };
  }

  const row = data as { id: string; system_prompt: string; model: string; temperature: number };
  return {
    id: row.id,
    system_prompt: row.system_prompt,
    model: row.model,
    temperature: Number(row.temperature),
  };
}

export interface AiPromptRow {
  id: string;
  agent_type: string;
  title: string;
  system_prompt: string;
  model: string;
  temperature: number;
}

/**
 * Список всех промптов для админки (выбор шаблона).
 */
export async function listPrompts(supabase: SupabaseClient): Promise<AiPromptRow[]> {
  const { data, error } = await supabase
    .from("ai_prompts")
    .select("id, agent_type, title, system_prompt, model, temperature")
    .order("agent_type");

  if (error) return [];
  return (data ?? []) as AiPromptRow[];
}
