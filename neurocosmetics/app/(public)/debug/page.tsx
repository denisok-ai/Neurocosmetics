"use client";

/**
 * @file page.tsx
 * @description Тестовый режим — вход под любой ролью, сидирование данных
 * Доступен только при NODE_ENV=development или NEXT_PUBLIC_DEBUG_MODE=true
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Shield,
  Settings,
  Database,
  LayoutDashboard,
  Package,
  FileText,
  BarChart3,
  Users,
  MessageSquare,
  FlaskConical,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrdersStore } from "@/lib/api/orders";

const ROLES = [
  { id: "user" as const, label: "Retail (B2C)", icon: User },
  { id: "b2b" as const, label: "Wholesale (B2B)", icon: Building2 },
  { id: "manager" as const, label: "Manager", icon: Shield },
  { id: "admin" as const, label: "Administrator", icon: Settings },
];

const MODULES = [
  { path: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { path: "/dashboard/orders", label: "Мои заказы", icon: Package },
  { path: "/dashboard/profile", label: "Профиль", icon: User },
  { path: "/dashboard/manager", label: "Управление заказами", icon: Package },
  { path: "/dashboard/manager/leads", label: "B2B заявки", icon: MessageSquare },
  { path: "/dashboard/admin/analytics", label: "Аналитика", icon: BarChart3 },
  { path: "/dashboard/admin/crm", label: "CRM", icon: Users },
  { path: "/dashboard/admin/audit", label: "Журнал аудита", icon: FileText },
  { path: "/dashboard/admin/llm-settings", label: "LLM настройки", icon: FlaskConical },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function DebugPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [seedResult, setSeedResult] = useState<{ orders: number; leads: number; audit: number } | null>(null);
  const setOrders = useOrdersStore((s) => s.setOrders);

  const handleLogin = async (role: string) => {
    setLoading(`login-${role}`);
    try {
      const res = await fetch("/api/debug/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error(await res.text());
      window.location.href = "/dashboard";
    } catch (e) {
      console.error(e);
      setLoading(null);
    }
  };

  const handleSeed = async () => {
    setLoading("seed");
    setSeedResult(null);
    try {
      const res = await fetch("/api/debug/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setOrders(data.orders ?? []);
      setSeedResult(data.seeded ?? { orders: 0, leads: 0, audit: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="section-landing bg-gradient-to-b from-[#FAFAFA] via-white to-[#FAFAFA]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(212,175,55,0.06),transparent)]" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/** Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="mb-12"
        >
          <motion.span variants={fadeUp} custom={0} className="landing-badge inline-flex">
            <Database className="h-3.5 w-3.5" />
            Режим отладки
          </motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="typography-h1 mt-6">
            Тестовый вход <span className="landing-heading-accent">без Supabase</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="typography-lead">
            Вход под любой ролью без аутентификации. Загрузите тестовые данные для проверки модулей.
          </motion.p>
        </motion.div>

        {/** Вход под ролью */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="landing-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-navy">Вход под ролью</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Выберите роль и перейдите в дашборд. Cookie действует 24 часа.
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {ROLES.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  onClick={() => handleLogin(id)}
                  disabled={loading !== null}
                  className="bg-gold text-navy font-medium hover:bg-gold-light"
                >
                  {loading === `login-${id}` ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="mr-2 h-4 w-4" />
                  )}
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/** Тестовые данные */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="landing-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-navy">Тестовые данные</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                45 заказов, 45 B2B-лидов, 45 записей аудита. Загрузите перед проверкой модулей.
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSeed}
                disabled={loading !== null}
                className="bg-gold text-navy font-medium hover:bg-gold-light"
              >
                {loading === "seed" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {loading === "seed" ? "Загрузка…" : "Загрузить тестовые данные"}
              </Button>
              {seedResult && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Загружено: <span className="font-medium text-gold">{seedResult.orders}</span> заказов,{" "}
                  <span className="font-medium text-gold">{seedResult.leads}</span> лидов,{" "}
                  <span className="font-medium text-gold">{seedResult.audit}</span> записей аудита
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/** Модули системы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="landing-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-navy">Модули системы</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Ссылки на все разделы. Доступ зависит от выбранной роли.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MODULES.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    href={path}
                    className="group flex items-center gap-3 rounded-xl border border-navy/5 bg-[#FAFAFA]/50 p-4 transition-all hover:border-gold/20 hover:bg-gold/5"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 transition-colors group-hover:bg-gold/20">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <span className="font-medium text-navy group-hover:text-gold">{label}</span>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:text-gold" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <p className="mt-8 text-xs text-muted-foreground">
          Режим отладки доступен только при NODE_ENV=development или NEXT_PUBLIC_DEBUG_MODE=true
        </p>
      </div>
    </section>
  );
}
