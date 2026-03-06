import { openai } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getActivePromptForAgent, DEFAULT_SALES_PROMPT } from "@/lib/api/ai-prompts";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRelevantContext } from "@/lib/rag/context";
import { getEmbedding } from "@/lib/rag/embed";
import { searchRagChunks } from "@/lib/rag/vector-store";

function getModel(modelId: string) {
  if (modelId.startsWith("deepseek-")) {
    return deepseek(modelId as "deepseek-chat" | "deepseek-reasoner");
  }
  return openai(modelId as "gpt-4o-mini" | "gpt-4o" | "gpt-4-turbo");
}

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

  let systemPrompt = DEFAULT_SALES_PROMPT.system_prompt;
  let modelId = DEFAULT_SALES_PROMPT.model;
  let temperature = DEFAULT_SALES_PROMPT.temperature;

  try {
    const config = await getActivePromptForAgent(supabase, "sales");
    systemPrompt = config.system_prompt || systemPrompt;
    modelId = config.model || modelId;
    temperature = config.temperature ?? temperature;
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
    model: getModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
    temperature,
  });

  return result.toUIMessageStreamResponse();
}
