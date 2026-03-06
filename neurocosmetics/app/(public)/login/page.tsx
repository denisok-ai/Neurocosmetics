/**
 * @file page.tsx
 * @description Страница входа (login)
 * @dependencies shadcn/ui, lib/supabase, login action
 * @created 2025-03-05
 */

import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Вход" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#FAFAFA] px-4 py-16">
      <Card className="w-full max-w-md border border-border bg-white shadow-lg">
        <CardHeader className="text-center">
          <FlaskConical className="mx-auto mb-2 h-8 w-8 text-gold" />
          <CardTitle className="font-serif text-2xl text-navy">Вход</CardTitle>
        </CardHeader>
        <CardContent>
          {params.error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {params.error}
            </div>
          )}
          {params.message && (
            <div className="mb-4 rounded-lg border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold-dark">
              {params.message}
            </div>
          )}

          <form className="space-y-4">
            <input type="hidden" name="redirect" value={params.redirect ?? ""} />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>

            <Button formAction={login} className="w-full bg-gold text-navy hover:bg-gold-light">
              Войти
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-gold hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
