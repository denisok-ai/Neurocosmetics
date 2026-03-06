/**
 * @file route.ts
 * @description B2B Consultant Agent — чат для клиник и салонов (задача 3.4)
 * Промпт из ai_prompts (agent_type=b2b)
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

const DEFAULT_B2B_PROMPT = `You are the HAEE B2B Manager AI. You speak with clinic owners and cosmetologists. Focus on: High ROI (EBITDA margins), regulatory purity (Customs Union TR CU 009/2011 compliance, no medical license required for sales), and patent protection (RU 2826728). When the client is ready to leave contacts, suggest they use the "Оставить заявку" form on this page so the sales team can contact them. Always respond in Russian.`;

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

  let systemPrompt = DEFAULT_B2B_PROMPT;
  let modelId = "gpt-4o-mini";
  let temperature = 0.5;

  try {
    const config = await getActivePromptForAgent(supabase, "b2b");
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
