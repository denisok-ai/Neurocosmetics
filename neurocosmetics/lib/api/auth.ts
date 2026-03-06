/**
 * @file auth.ts
 * @description Мок-сервис авторизации (без реального Supabase)
 * @dependencies lib/types
 * @created 2025-03-05
 */

import type { Profile, UserRole } from "@/lib/types";

const MOCK_USER: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  role: "admin",
  full_name: "Demo Admin",
  phone: null,
  email: "admin@haee-neuro.ru",
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export async function getCurrentUser(): Promise<Profile | null> {
  return MOCK_USER;
}

export async function signIn(
  _email: string,
  _password: string
): Promise<{ user: Profile | null; error: string | null }> {
  return { user: MOCK_USER, error: null };
}

export async function signOut(): Promise<void> {
  return;
}

export function hasRole(user: Profile | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
