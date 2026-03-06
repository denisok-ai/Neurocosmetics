/**
 * @file types.ts
 * @description Типы для RAG: документы, эмбеддинги, контекст
 * @created 2025-03-06
 */

export interface RAGDocument {
  id: string;
  content: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface RAGSearchResult {
  document: RAGDocument;
  score: number;
}
