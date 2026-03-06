"use client";

import { useMemo, useEffect } from "react";
import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrdersStore } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/payments";
import type { OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Ожидают оплаты",
  paid: "Оплачены",
  shipped: "В доставке",
  delivered: "Доставлены",
  cancelled: "Отменены",
};

const CHART_COLORS = ["#d4af37", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function AnalyticsContent() {
  const { orders, fetchOrders } = useOrdersStore();

  useEffect(() => {
    fetchOrders("all");
  }, [fetchOrders]);

  const stats = useMemo(() => {
    const paidOrders = orders.filter((o) => o.status !== "cancelled" && o.status !== "pending");
    const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const avgOrder = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const byStatus = orders.reduce(
      (acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<OrderStatus, number>
    );
    return { totalRevenue, totalOrders, avgOrder, byStatus, paidCount: paidOrders.length };
  }, [orders]);

  const statusChartData = useMemo(
    () =>
      (["pending", "paid", "shipped", "delivered", "cancelled"] as OrderStatus[]).map(
        (status, i) => ({
          name: STATUS_LABELS[status],
          count: stats.byStatus[status] ?? 0,
          fill: CHART_COLORS[i],
        })
      ),
    [stats.byStatus]
  );

  const revenueByDate = useMemo(() => {
    const map = new Map<string, number>();
    orders
      .filter((o) => o.status !== "cancelled" && o.status !== "pending")
      .forEach((o) => {
        const d = o.created_at.slice(0, 10);
        map.set(d, (map.get(d) ?? 0) + o.total);
      });
    return Array.from(map.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [orders]);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Аналитика</h1>
      <p className="mt-2 text-muted-foreground">
        Сводка по продажам и заказам (данные из Supabase)
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
              <TrendingUp className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Выручка</p>
              <p className="font-serif text-lg font-bold text-gold">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Всего заказов</p>
              <p className="text-lg font-bold text-navy">{stats.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Средний чек</p>
              <p className="text-lg font-bold text-navy">
                {formatPrice(stats.avgOrder)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <ShoppingCart className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Оплачено заказов</p>
              <p className="text-lg font-bold text-navy">{stats.paidCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg text-navy">Заказы по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,138,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [value ?? 0, "Заказов"]}
                    contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 8 }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg text-navy">Заказы по статусам (круговая)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData.filter((d) => d.count > 0)}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(props) => `${props.name ?? ""}: ${props.value ?? 0}`}
                  >
                    {statusChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value ?? 0, "Заказов"]}
                    contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 8 }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {revenueByDate.length > 0 && (
        <Card className="dashboard-card mt-8">
          <CardHeader>
            <CardTitle className="text-lg text-navy">Выручка по дням (последние 14 дней)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByDate} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,138,0.1)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatPrice(Number(value) || 0), "Выручка"]}
                    contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 8 }}
                  />
                  <Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="dashboard-card mt-8">
        <CardHeader>
          <CardTitle className="text-lg text-navy">Заказы по статусам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(
              [
                "pending",
                "paid",
                "shipped",
                "delivered",
                "cancelled",
              ] as OrderStatus[]
            ).map((status) => {
              const count = stats.byStatus[status] ?? 0;
              const Icon =
                status === "pending"
                  ? Clock
                  : status === "paid"
                    ? DollarSign
                    : status === "shipped"
                      ? Truck
                      : status === "delivered"
                        ? CheckCircle2
                        : XCircle;
              return (
                <div
                  key={status}
                  className="flex items-center gap-3 rounded-lg border border-navy/10 p-3"
                >
                  <Icon className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {STATUS_LABELS[status]}
                    </p>
                    <p className="font-semibold text-navy">{count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Конверсия и LTV считаются после подключения аналитики посещений и БД
        заказов.
      </p>
    </div>
  );
}
