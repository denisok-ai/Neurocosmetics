/**
 * @file index.ts
 * @description Публичный API RAG: контекст для чат-ботов. Дальше — эмбеддинги (OpenAI) и pgvector.
 * @created 2025-03-06
 */

export { getRelevantContext } from "./context";
export type { RAGDocument, RAGSearchResult } from "./types";
