/**
 * @file page.tsx
 * @description Личный кабинет пользователя — сводка и Care Companion
 * @dependencies components/chat/care-chat-block
 * @created 2025-03-05
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Package, Calendar, Star, ArrowRight } from "lucide-react";
import { CareChatBlock } from "@/components/chat/care-chat-block";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Личный кабинет",
};

async function getActiveOrdersCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["pending", "paid", "shipped"]);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const activeOrdersCount = user ? await getActiveOrdersCount(user.id) : 0;

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Личный кабинет</h1>
      <p className="mt-2 text-muted-foreground">
        Добро пожаловать! Здесь вы можете отслеживать заказы и управлять курсом.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Link href="/dashboard/orders" className="dashboard-card group block">
          <Package className="mb-3 h-8 w-8 text-gold" />
          <h3 className="font-semibold text-navy">Мои заказы</h3>
          <p className="mt-1 text-2xl font-bold text-gold">{activeOrdersCount}</p>
          <p className="text-xs text-muted-foreground">активных заказов</p>
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-gold group-hover:underline">
            Перейти <ArrowRight className="h-3 w-3" />
          </p>
        </Link>

        <div className="dashboard-card">
          <Calendar className="mb-3 h-8 w-8 text-gold" />
          <h3 className="font-semibold text-navy">Мой курс</h3>
          <p className="mt-1 text-2xl font-bold text-gold">—</p>
          <p className="text-xs text-muted-foreground">следующая процедура</p>
        </div>

        <div className="dashboard-card">
          <Star className="mb-3 h-8 w-8 text-gold" />
          <h3 className="font-semibold text-navy">Бонусы</h3>
          <p className="mt-1 text-2xl font-bold text-gold">0</p>
          <p className="text-xs text-muted-foreground">баллов лояльности</p>
        </div>
      </div>

      <div className="mt-8 max-w-xl">
        <CareChatBlock />
      </div>
    </div>
  );
}
