/**
 * @file context.ts
 * @description RAG: релевантный контекст по запросу — семантический поиск (OpenAI embeddings) или keyword fallback.
 * @dependencies lib/rag/types, lib/rag/embed
 * @created 2025-03-06
 */

import { getEmbedding, cosineSimilarity } from "./embed";

/** Статичные фрагменты для контекста (FAQ, наука, продукты) — до внедрения векторной БД */
const STATIC_CHUNKS: { keywords: string[]; text: string }[] = [
  {
    keywords: ["плечо", "лицо", "нанесение", "зона"],
    text: "Сыворотку HAEE наносят на наружную поверхность плеча (не на лицо): через микроканалы пептид попадает в кровоток для системной нейропротекции. Кожа лица чувствительнее; при розацеа мезороллер противопоказан.",
  },
  {
    keywords: ["курс", "процедур", "частота", "7", "10", "дней"],
    text: "Курс: 1 процедура в 7–10 дней. Набор из 10 ампул рассчитан на 2–3 месяца. HAEE Intensive: первые 4 недели 1 раз в 5–7 дней, далее 7–10 дней.",
  },
  {
    keywords: ["spf", "солнце", "защита", "после"],
    text: "После процедуры обязательно SPF 30+ на следующее утро на обработанную зону. 24 часа — без сауны и бассейна.",
  },
  {
    keywords: ["безопасн", "токсич", "аллерг", "тр тс"],
    text: "Доклинические данные: отсутствие токсичности до 2000 мг/кг, отсутствие аллергических реакций. Соответствие ТР ТС 009/2011.",
  },
  {
    keywords: ["мезороллер", "замен", "игл"],
    text: "Мезороллер заменять через 10–15 процедур из-за затупления игл.",
  },
  {
    keywords: ["430", "норма", "пг/мл", "дефицит"],
    text: "Физиологическая норма HAEE в плазме ~430 пг/мл. Дефицит коррелирует с нейродегенерацией; трансдермальное введение восполняет уровень.",
  },
  {
    keywords: ["starter", "старт", "начал", "первый", "12900", "12 900"],
    text: "HAEE Starter: Системный старт — 12 900 ₽. 10 ампул по 2 мл, мезороллер, спиртовые салфетки, протокол. Курс 10 процедур (7–10 дней), около 2,5 месяцев. Идеально для первого знакомства.",
  },
  {
    keywords: ["intensive", "интенсив", "19900", "19 900", "фотостарен", "постковид"],
    text: "HAEE Intensive: Нейро-Регенерация — 19 900 ₽. 20 ампул (2 упаковки), мезороллер с заменой через 15 процедур, крем-постуход SPF 30+. Для выраженного фотостарения или дефицита пептида (постковид, стресс).",
  },
  {
    keywords: ["refill", "рефилл", "поддерж", "8500", "8 500"],
    text: "HAEE Refill: Поддерживающий уход — 8 500 ₽. 10 ампул по 2 мл, без мезороллера. 1 процедура в 2–4 недели для поддержания нормы HAEE и профилактики пигментации.",
  },
  {
    keywords: ["professional", "профессионал", "b2b", "клиник", "салон"],
    text: "HAEE Professional: B2B-Box — для клиник и нейрореабилитации. Диспенсер 50–100 ампул, сменные насадки для аппаратов микронидлинга, доступ к AI-аттестации. Цена по запросу.",
  },
  {
    keywords: ["протокол", "горизонталь", "вертикаль", "диагональ", "прокат"],
    text: "Протокол мезороллера: горизонтальные проходы 4–6 раз, затем вертикальные 4–6 раз, затем диагональные 2–4 раза. Каждая точка кожи — 4–6 микропроколов за процедуру. Сыворотку наносить капельно, не втирать.",
  },
  {
    keywords: ["амилоид", "55", "бляшк", "нейропротек"],
    text: "HAEE снижает амилоидные бляшки на 55% (доклинически; у аналога Alzhemed — 30%). Эндогенный нейрорегулятор, трансдермальная доставка восполняет дефицит и поддерживает нейропротекцию.",
  },
  {
    keywords: ["купить", "заказ", "магазин", "цена", "стоимость"],
    text: "Наборы в магазине: Starter 12 900 ₽, Intensive 19 900 ₽, Refill 8 500 ₽. B2B Professional — по запросу. Рекомендуем перейти в раздел «Магазин» для оформления заказа.",
  },
];

/** Экспорт чанков для индексации в pgvector (seed) */
export function getChunksForSeed(): { content: string; source: string }[] {
  return STATIC_CHUNKS.map((c) => ({ content: c.text, source: "static" }));
}

/** Кэш эмбеддингов чанков (заполняется при первом запросе с OPENAI_API_KEY) */
let chunkEmbeddingsCache: number[][] | null = null;

async function getChunkEmbeddings(): Promise<number[][] | null> {
  if (chunkEmbeddingsCache) return chunkEmbeddingsCache;
  const texts = STATIC_CHUNKS.map((c) => c.text);
  const vecs: number[][] = [];
  for (const text of texts) {
    const v = await getEmbedding(text);
    if (!v) return null;
    vecs.push(v);
  }
  chunkEmbeddingsCache = vecs;
  return vecs;
}

/** Keyword-поиск по чанкам (fallback при отсутствии эмбеддингов) */
function searchByKeywords(query: string, maxChunks: number): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const scored = STATIC_CHUNKS.map((chunk) => {
    const hits = chunk.keywords.filter((kw) => q.includes(kw));
    return { ...chunk, score: hits.length };
  }).filter((c) => c.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxChunks).map((c) => c.text);
}

/**
 * Возвращает релевантный текстовый контекст для вставки в промпт чата.
 * При наличии OPENAI_API_KEY — семантический поиск по эмбеддингам; иначе — по ключевым словам.
 */
export async function getRelevantContext(query: string, maxChunks = 3): Promise<string> {
  const q = query.trim();
  if (!q) return "";

  const queryEmbedding = await getEmbedding(q);
  const chunkVecs = queryEmbedding ? await getChunkEmbeddings() : null;

  if (queryEmbedding && chunkVecs) {
    const scored = STATIC_CHUNKS.map((chunk, i) => ({
      text: chunk.text,
      score: cosineSimilarity(queryEmbedding, chunkVecs[i]!),
    }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored
      .slice(0, maxChunks)
      .filter((c) => c.score > 0.2)
      .map((c) => c.text);
    if (top.length > 0) return top.join("\n\n");
  }

  const byKeywords = searchByKeywords(q, maxChunks);
  return byKeywords.length > 0 ? byKeywords.join("\n\n") : "";
}
