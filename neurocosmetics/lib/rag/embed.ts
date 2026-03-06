/**
 * @file embed.ts
 * @description Эмбеддинги OpenAI для семантического поиска RAG
 * @created 2025-03-06
 */

import OpenAI from "openai";

const EMBED_MODEL = "text-embedding-3-small";

function getClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) return null;
  return new OpenAI({ apiKey: key });
}

/**
 * Возвращает вектор эмбеддинга для текста (1536 размерность у text-embedding-3-small).
 * При отсутствии OPENAI_API_KEY возвращает null.
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  const client = getClient();
  if (!client) return null;
  const t = text.trim().slice(0, 8000);
  if (!t) return null;
  try {
    const res = await client.embeddings.create({
      model: EMBED_MODEL,
      input: t,
    });
    const vec = res.data?.[0]?.embedding;
    return Array.isArray(vec) ? vec : null;
  } catch {
    return null;
  }
}

/** Косинусное сходство между двумя векторами (0..1) */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
