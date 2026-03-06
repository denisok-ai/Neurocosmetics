/**
 * @file rbac.ts
 * @description Утилиты RBAC — проверка ролей и маршрутов
 * @dependencies lib/types
 * @created 2025-03-05
 */

import type { UserRole } from "@/lib/types";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  b2b: 2,
  manager: 3,
  admin: 4,
};

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasRole(userRole: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(userRole);
}

interface RouteRule {
  pattern: RegExp;
  roles: UserRole[];
}

const PROTECTED_ROUTES: RouteRule[] = [
  { pattern: /^\/dashboard\/admin/, roles: ["admin"] },
  { pattern: /^\/dashboard\/manager/, roles: ["manager", "admin"] },
  { pattern: /^\/dashboard/, roles: ["user", "b2b", "manager", "admin"] },
];

export function getRequiredRoles(pathname: string): UserRole[] | null {
  for (const rule of PROTECTED_ROUTES) {
    if (rule.pattern.test(pathname)) {
      return rule.roles;
    }
  }
  return null;
}
