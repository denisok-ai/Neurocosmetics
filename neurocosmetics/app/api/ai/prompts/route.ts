/**
 * @file route.ts
 * @description API: загрузка и сохранение системных промптов (задача 3.5)
 * GET ?agent=sales — текущий промпт для чата; GET без query — список для админки
 * PATCH — обновление промпта (только admin)
 * @created 2025-03-06
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActivePromptForAgent, listPrompts, DEFAULT_SALES_PROMPT } from "@/lib/api/ai-prompts";
import type { AgentType } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agent = searchParams.get("agent") as AgentType | null;

  try {
    const supabase = await createClient();

    if (agent) {
      const config = await getActivePromptForAgent(supabase, agent);
      return NextResponse.json(config);
    }

    const list = await listPrompts(supabase);
    return NextResponse.json(list);
  } catch (e) {
    console.error("[api/ai/prompts] GET", e);
    if (agent === "sales") {
      return NextResponse.json(DEFAULT_SALES_PROMPT, { status: 200 });
    }
    return NextResponse.json({ error: "Failed to load prompts" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as {
      id?: string;
      agent_type?: AgentType;
      system_prompt?: string;
      model?: string;
      temperature?: number;
      title?: string;
    };

    if (body.id) {
      const updates: Record<string, unknown> = {};
      if (body.system_prompt != null) updates.system_prompt = body.system_prompt;
      if (body.model != null) updates.model = body.model;
      if (body.temperature != null) updates.temperature = body.temperature;
      if (body.title != null) updates.title = body.title;
      const { error } = await supabase.from("ai_prompts").update(updates).eq("id", body.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (body.agent_type) {
      const { data: existing } = await supabase
        .from("ai_prompts")
        .select("id")
        .eq("agent_type", body.agent_type)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      const updates: Record<string, unknown> = {
        system_prompt: body.system_prompt ?? "",
        model: body.model ?? "gpt-4o-mini",
        temperature: body.temperature ?? 0.7,
      };
      if (body.title != null) updates.title = body.title;

      if (existing?.id) {
        const { error } = await supabase.from("ai_prompts").update(updates).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ai_prompts").insert({
          agent_type: body.agent_type,
          title: body.title ?? body.agent_type,
          ...updates,
          is_active: true,
        });
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "id or agent_type required" }, { status: 400 });
  } catch (e) {
    console.error("[api/ai/prompts] PATCH", e);
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
}
