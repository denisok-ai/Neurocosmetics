/**
 * @file rate-limit.ts
 * @description Простой in-memory rate limiter для API (по user ID)
 * @created 2025-03-06
 */

const WINDOW_MS = 60_000; // 1 минута
const MAX_REQUESTS = 30; // 30 запросов в минуту на пользователя

const store = new Map<
  string,
  { count: number; resetAt: number }
>();

function cleanup() {
  const now = Date.now();
  for (const [key, v] of store.entries()) {
    if (v.resetAt < now) store.delete(key);
  }
}

/** Вызывать не чаще чем раз в минуту */
let lastCleanup = 0;
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup > WINDOW_MS) {
    lastCleanup = now;
    cleanup();
  }
}

/**
 * Проверяет rate limit. Возвращает true, если запрос разрешён, false — если лимит превышен.
 */
export function checkRateLimit(userId: string): boolean {
  maybeCleanup();
  const now = Date.now();
  const entry = store.get(userId);

  if (!entry) {
    store.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.resetAt < now) {
    store.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}
