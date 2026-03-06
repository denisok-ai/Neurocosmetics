"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  ArrowRight,
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pagination } from "@/components/ui/pagination";
import { useOrdersStore } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/payments";
import type { OrderStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  pending: { label: "Ожидает", variant: "outline", icon: Clock },
  paid: { label: "Оплачен", variant: "secondary", icon: DollarSign },
  shipped: { label: "Доставка", variant: "default", icon: Truck },
  delivered: { label: "Доставлен", variant: "secondary", icon: CheckCircle2 },
  cancelled: { label: "Отменён", variant: "destructive", icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];
const ORDERS_PER_PAGE = 10;

export function ManagerContent() {
  const { orders, fetchOrders } = useOrdersStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders("all");
  }, [fetchOrders]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.user_id.toLowerCase().includes(q) ||
          o.items.some((i) => i.product_name.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) =>
      sortBy === "total"
        ? b.total - a.total
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return result;
  }, [orders, statusFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(
    () =>
      filtered.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0);
    const byStatus = ALL_STATUSES.reduce(
      (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }),
      {} as Record<OrderStatus, number>
    );
    return { totalRevenue, total: orders.length, byStatus };
  }, [orders]);

  const [namesMap, setNamesMap] = useState<Record<string, string>>({});
  const uniqueUserIds = useMemo(
    () => Array.from(new Set(orders.map((o) => o.user_id))),
    [orders]
  );
  useEffect(() => {
    if (uniqueUserIds.length === 0) {
      setNamesMap({});
      return;
    }
    fetch(`/api/profiles?ids=${uniqueUserIds.join(",")}`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((map: Record<string, string>) => setNamesMap(map))
      .catch(() => setNamesMap({}));
  }, [uniqueUserIds.join(",")]);

  const displayName = useCallback(
    (userId: string) => {
      const name = namesMap[userId]?.trim();
      return name || `${userId.slice(0, 8)}…`;
    },
    [namesMap]
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">
            Управление заказами
          </h1>
          <p className="mt-1 text-muted-foreground">
            Панель менеджера — все заказы портала.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-lg font-bold text-navy">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Truck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">В доставке</p>
              <p className="text-lg font-bold text-navy">
                {stats.byStatus.shipped}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ожидают оплаты</p>
              <p className="text-lg font-bold text-navy">
                {stats.byStatus.pending}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6 bg-navy/10" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по ID, клиенту, товару..."
            className="border-navy/10 bg-white pl-9"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-navy/10 bg-white p-1">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
              statusFilter === "all"
                ? "bg-gold/20 text-gold"
                : "text-muted-foreground hover:text-navy"
            }`}
          >
            Все
          </button>
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  statusFilter === s
                    ? "bg-gold/20 text-gold"
                    : "text-muted-foreground hover:text-navy"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-navy/10 bg-white p-1">
          <button
            type="button"
            onClick={() => {
              setSortBy("date");
              setPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
              sortBy === "date"
                ? "bg-gold/20 text-gold"
                : "text-muted-foreground hover:text-navy"
            }`}
          >
            По дате
          </button>
          <button
            type="button"
            onClick={() => {
              setSortBy("total");
              setPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
              sortBy === "total"
                ? "bg-gold/20 text-gold"
                : "text-muted-foreground hover:text-navy"
            }`}
          >
            По сумме
          </button>
        </div>
      </div>

      {/* Orders table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-navy/10 bg-white shadow-[0_2px_12px_rgba(11,19,43,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/10 bg-navy/[0.02]">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Клиент
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Товары
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Статус
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Сумма
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Дата
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Заказы не найдены
                  </td>
                </tr>
              )}
              {paginatedOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr
                    key={order.id}
                    className="border-b border-navy/5 transition-colors hover:bg-gold/5"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-navy">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-navy">
                      {displayName(order.user_id)}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                      {order.items.map((i) => i.product_name).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={cfg.variant}
                        className="inline-flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-gold">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-gold/5 hover:text-gold"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "Заказы не найдены"
            : `Показано ${(page - 1) * ORDERS_PER_PAGE + 1}–${Math.min(page * ORDERS_PER_PAGE, filtered.length)} из ${filtered.length} заказов`}
        </p>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
