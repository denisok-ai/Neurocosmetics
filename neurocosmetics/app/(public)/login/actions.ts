/**
 * @file actions.ts
 * @description Server Actions для входа и регистрации
 * @dependencies lib/supabase/server
 * @created 2025-03-05
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    const params = new URLSearchParams({ error: error.message });
    redirect(`/login?${params.toString()}`);
  }

  const redirectTo = formData.get("redirect") as string;
  revalidatePath("/", "layout");
  redirect(redirectTo || "/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    const params = new URLSearchParams({ error: error.message });
    redirect(`/register?${params.toString()}`);
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Проверьте почту для подтверждения регистрации");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
