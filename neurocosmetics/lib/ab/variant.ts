/**
 * @file variant.ts
 * @description Назначение варианта A/B: детерминированно по visitor_id + experiment_id
 * @created 2025-03-06
 */

import type { VariantId } from "./experiments";

const COOKIE_PREFIX = "ab_";
const VISITOR_COOKIE = "ab_visitor";
const COOKIE_MAX_AGE_DAYS = 30;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

function setCookie(name: string, value: string, maxAgeDays: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeDays * 86400}; SameSite=Lax`;
}

/** Простой хеш для детерминированного назначения */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Возвращает или создаёт visitor_id (для консистентности варианта между визитами).
 */
export function getOrCreateVisitorId(): string {
  let vid = getCookie(VISITOR_COOKIE);
  if (!vid) {
    vid = crypto.randomUUID?.() ?? `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    setCookie(VISITOR_COOKIE, vid, COOKIE_MAX_AGE_DAYS);
  }
  return vid;
}

/**
 * Назначает вариант A или B детерминированно по visitor_id + experiment_id.
 */
export function assignVariant(experimentId: string): VariantId {
  const visitorId = getOrCreateVisitorId();
  const h = hash(`${visitorId}:${experimentId}`);
  return h % 2 === 0 ? "A" : "B";
}

/**
 * Возвращает сохранённый вариант или назначает новый и сохраняет в cookie.
 */
export function getVariant(experimentId: string): VariantId {
  const cookieName = `${COOKIE_PREFIX}${experimentId}`;
  const stored = getCookie(cookieName);
  if (stored === "A" || stored === "B") return stored;
  const variant = assignVariant(experimentId);
  setCookie(cookieName, variant, COOKIE_MAX_AGE_DAYS);
  return variant;
}
