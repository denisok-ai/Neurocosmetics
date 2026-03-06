/**
 * @file vector-store.ts
 * @description Поиск по таблице rag_chunks (pgvector) в Supabase
 * @created 2025-03-06
 */

const EMBED_DIM = 1536;

/**
 * Преобразует массив чисел в формат строки для PostgreSQL vector.
 * Supabase принимает vector как строку вида '[0.1, -0.2, ...]'.
 */
export function toVectorString(vec: number[]): string {
  if (vec.length !== EMBED_DIM) return "";
  return `[${vec.join(",")}]`;
}

/** Подходит для SupabaseClient: .rpc() возвращает thenable (PostgrestFilterBuilder), дающий { data, error } */
export type SupabaseRpc = {
  rpc: (
    fn: string,
    params: { query_embedding: string; match_count: number; match_threshold?: number }
  ) => PromiseLike<{ data: unknown; error: unknown }>;
};

/**
 * Ищет в таблице rag_chunks по косинусному сходству с query_embedding.
 * Требует: расширение vector, таблица rag_chunks, функция match_rag_chunks (см. lib/supabase/schema.sql).
 */
export async function searchRagChunks(
  supabase: SupabaseRpc,
  queryEmbedding: number[],
  limit = 4,
  threshold = 0.2
): Promise<string[]> {
  const vecStr = toVectorString(queryEmbedding);
  if (!vecStr) return [];

  const { data, error } = await supabase.rpc("match_rag_chunks", {
    query_embedding: vecStr,
    match_count: limit,
    match_threshold: threshold,
  });

  if (error || !Array.isArray(data)) return [];
  return data.map((row: { content?: string }) => row?.content).filter(Boolean) as string[];
}
