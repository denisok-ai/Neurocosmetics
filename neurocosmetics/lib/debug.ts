/**
 * @file debug.ts
 * @description Режим отладки — вход под любой ролью без Supabase
 * @created 2025-03-06
 */

import type { UserRole } from "@/lib/types";

const DEBUG_COOKIE = "debug-role";
const DEBUG_MODE_ENV = "NEXT_PUBLIC_DEBUG_MODE";
/** Серверная переменная — читается в рантайме, без пересборки */
const DEBUG_MODE_SERVER = "DEBUG_MODE";

export function isDebugMode(): boolean {
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
    return true;
  }
  if (typeof process !== "undefined" && process.env?.[DEBUG_MODE_ENV] === "true") {
    return true;
  }
  if (typeof process !== "undefined" && process.env?.[DEBUG_MODE_SERVER] === "true") {
    return true;
  }
  return false;
}

export function getDebugRoleFromCookie(cookieHeader: string | null): UserRole | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${DEBUG_COOKIE}=([^;]+)`));
  if (!match) return null;
  const role = match[1]?.trim();
  const valid: UserRole[] = ["user", "b2b", "manager", "admin"];
  return valid.includes(role as UserRole) ? (role as UserRole) : null;
}

export function getDebugRoleFromCookies(cookies: { get: (name: string) => { value: string } | undefined }): UserRole | null {
  const c = cookies.get(DEBUG_COOKIE);
  if (!c?.value) return null;
  const valid: UserRole[] = ["user", "b2b", "manager", "admin"];
  return valid.includes(c.value as UserRole) ? (c.value as UserRole) : null;
}

/** Mock user ID для режима отладки */
export const DEBUG_USER_ID = "debug-user-00000000-0000-0000-0000-000000000001";

export { DEBUG_COOKIE };
