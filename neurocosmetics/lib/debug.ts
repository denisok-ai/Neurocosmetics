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
  // #region agent log
  const _debugResult =
    process.env?.NODE_ENV === "development" ||
    process.env?.[DEBUG_MODE_ENV] === "true" ||
    process.env?.[DEBUG_MODE_SERVER] === "true";
  fetch('http://127.0.0.1:7639/ingest/c4d30fcc-c6c4-4880-a50c-b9c970baa794',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e25b46'},body:JSON.stringify({sessionId:'e25b46',location:'lib/debug.ts:isDebugMode',message:'isDebugMode called',data:{NODE_ENV:process.env?.NODE_ENV,DEBUG_MODE:process.env?.[DEBUG_MODE_SERVER],NEXT_PUBLIC_DEBUG_MODE:process.env?.[DEBUG_MODE_ENV],result:_debugResult},timestamp:Date.now(),hypothesisId:'H-A,H-B,H-D'})}).catch(()=>{});
  // #endregion
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
