/**
 * @file page.tsx
 * @description B2B-раздел: для клиник и салонов, чат-консультант и форма заявки (задача 3.4)
 * @dependencies components/b2b/b2b-chat-block
 * @created 2025-03-06
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, FileCheck, Shield } from "lucide-react";
import { B2BLeadForm } from "./b2b-lead-form";
import { B2BChatBlock } from "@/components/b2b/b2b-chat-block";

export const metadata: Metadata = {
  title: "B2B — Для клиник и салонов",
  description:
    "Оптовые поставки HAEE Neurocosmetics для клиник красоты и косметологических салонов. Сертификация, патент RU 2826728.",
};

export default function B2BPage() {
  return (
    <div className="bg-[#FAFAFA]">
      <section className="border-b border-border bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-navy">
            HAEE для <span className="text-gold">клиник и салонов</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Оптовые поставки нейрокосметики с подтверждённой эффективностью. Соответствие ТР ТС
            009/2011, патент РФ № 2826728. Не требует медицинской лицензии для продажи.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-4">
              <Building2 className="h-8 w-8 shrink-0 text-gold" />
              <div>
                <h3 className="font-semibold text-navy">Выгодные условия</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Маржинальность и рост EBITDA для вашего бизнеса
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-4">
              <FileCheck className="h-8 w-8 shrink-0 text-gold" />
              <div>
                <h3 className="font-semibold text-navy">Сертификация</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  ТР ТС 009/2011, косметика — без медлицензии
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-4">
              <Shield className="h-8 w-8 shrink-0 text-gold" />
              <div>
                <h3 className="font-semibold text-navy">Патентная защита</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Патент РФ № 2826728 на способ применения
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy">Заявка на сотрудничество</h2>
              <p className="mt-2 text-muted-foreground">
                Оставьте контакты — менеджер свяжется с вами для обсуждения условий.
              </p>
              <B2BLeadForm />
            </div>
            <div>
              <B2BChatBlock />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Интересует розничная покупка?{" "}
            <Link href="/shop" className="font-medium text-gold hover:underline">
              Перейти в магазин <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
