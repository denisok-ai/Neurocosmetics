/**
 * @file route.ts
 * @description Care Companion Agent — чат в личном кабинете (задача 3.3)
 * Использует промпт agent_type=care из ai_prompts, инструмент reorder_kit
 * @created 2025-03-06
 */

import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getActivePromptForAgent } from "@/lib/api/ai-prompts";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRelevantContext } from "@/lib/rag/context";
import { getEmbedding } from "@/lib/rag/embed";
import { searchRagChunks } from "@/lib/rag/vector-store";

const DEFAULT_CARE_PROMPT = `You are the HAEE Care Companion. The user has purchased the ampoule kit. Instructions: Meso-roller is strictly individual. Use 0.5-1.0 ml per procedure on the upper arm. Roll horizontally, vertically, diagonally (4-6 times). Redness for 1-3 hours is normal. MUST remind about SPF 30+ the next morning. Your goal: Ensure safe usage, answer procedural questions, and gently suggest repurchasing when the 10-ampoule kit is almost empty — recommend they visit the Shop (/shop) to reorder. Always respond in Russian.`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Требуется авторизация" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!checkRateLimit(user.id)) {
    return new Response(JSON.stringify({ error: "Слишком много запросов. Подождите минуту." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };

  let systemPrompt = DEFAULT_CARE_PROMPT;
  let modelId = "gpt-4o-mini";
  let temperature = 0.6;

  try {
    const config = await getActivePromptForAgent(supabase, "care");
    if (config.system_prompt) systemPrompt = config.system_prompt;
    if (config.model) modelId = config.model;
    if (config.temperature != null) temperature = config.temperature;
  } catch {
    // use defaults
  }

  const lastUser = messages.filter((m) => m.role === "user").pop();
  const textPart = lastUser?.parts?.find((p) => p && "text" in p);
  const query = (textPart && typeof (textPart as { text: string }).text === "string" ? (textPart as { text: string }).text : "").trim();

  let ragContext = "";
  if (query) {
    const queryEmbedding = await getEmbedding(query);
    if (queryEmbedding) {
      const fromDb = await searchRagChunks(supabase, queryEmbedding, 4, 0.2);
      if (fromDb.length > 0) ragContext = fromDb.join("\n\n");
    }
    if (!ragContext) ragContext = await getRelevantContext(query, 4);
  }
  if (ragContext) {
    systemPrompt += `\n\nКонтекст из базы знаний (используй при ответе):\n${ragContext}`;
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai(modelId as "gpt-4o-mini" | "gpt-4o"),
    system: systemPrompt,
    messages: modelMessages,
    temperature,
  });

  return result.toUIMessageStreamResponse();
}
