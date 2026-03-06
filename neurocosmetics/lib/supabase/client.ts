/**
 * @file client.ts
 * @description Supabase browser-клиент (Client Components)
 * @dependencies @supabase/ssr
 * @created 2025-03-05
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
