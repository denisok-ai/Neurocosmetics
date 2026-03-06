/**
 * @file page.tsx
 * @description Страница регистрации
 * @dependencies shadcn/ui, signup action
 * @created 2025-03-05
 */

import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signup } from "../login/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Регистрация" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#FAFAFA] px-4 py-16">
      <Card className="w-full max-w-md border border-border bg-white shadow-lg">
        <CardHeader className="text-center">
          <FlaskConical className="mx-auto mb-2 h-8 w-8 text-gold" />
          <CardTitle className="font-serif text-2xl text-navy">Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          {params.error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {params.error}
            </div>
          )}

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Имя</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                required
                placeholder="Иван Иванов"
              />
            </div>

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
                placeholder="Минимум 6 символов"
              />
            </div>

            <Button formAction={signup} className="w-full bg-gold text-navy hover:bg-gold-light">
              Зарегистрироваться
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-gold hover:underline">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
