"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { User, Package, DollarSign, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { useOrdersStore } from "@/lib/api/orders";

const CLIENTS_PER_PAGE = 10;
import { formatPrice } from "@/lib/api/payments";

interface ClientRow {
  user_id: string;
  order_count: number;
  total: number;
  last_order_at: string;
}

export function CrmContent() {
  const { orders, fetchOrders } = useOrdersStore();
  const [leadsCount, setLeadsCount] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders("all");
  }, [fetchOrders]);
  const [clientsPage, setClientsPage] = useState(1);

  const clients = useMemo<ClientRow[]>(() => {
    const map = new Map<string, { order_count: number; total: number; last_order_at: string }>();
    orders.forEach((o) => {
      const prev = map.get(o.user_id);
      const total = prev ? prev.total + o.total : o.total;
      const order_count = prev ? prev.order_count + 1 : 1;
      const last =
        !prev || new Date(o.created_at) > new Date(prev.last_order_at)
          ? o.created_at
          : prev.last_order_at;
      map.set(o.user_id, { order_count, total, last_order_at: last });
    });
    return Array.from(map.entries()).map(([user_id, v]) => ({
      user_id,
      order_count: v.order_count,
      total: v.total,
      last_order_at: v.last_order_at,
    }));
  }, [orders]);

  const [namesMap, setNamesMap] = useState<Record<string, string>>({});
  const clientIds = useMemo(() => clients.map((c) => c.user_id), [clients]);
  useEffect(() => {
    if (clientIds.length === 0) {
      setNamesMap({});
      return;
    }
    fetch(`/api/profiles?ids=${clientIds.join(",")}`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((map: Record<string, string>) => setNamesMap(map))
      .catch(() => setNamesMap({}));
  }, [clientIds.join(",")]);

  useEffect(() => {
    fetch("/api/b2b/leads")
      .then((res) => (res.ok ? res.json() : []))
      .then((list: unknown[]) => setLeadsCount(list.length))
      .catch(() => setLeadsCount(0));
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">CRM</h1>
      <p className="mt-2 text-muted-foreground">Клиенты по заказам и B2B-лиды</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-navy">Клиенты (по заказам)</CardTitle>
            <span className="text-sm text-muted-foreground">
              {clients.length} {clients.length === 1 ? "клиент" : "клиентов"}
            </span>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-muted-foreground">Нет заказов — список клиентов пуст.</p>
            ) : (
              <>
                <div className="space-y-3">
                  {clients
                    .slice((clientsPage - 1) * CLIENTS_PER_PAGE, clientsPage * CLIENTS_PER_PAGE)
                    .map((c) => (
                  <div
                    key={c.user_id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gold" />
                      <span className="text-sm text-navy">
                        {namesMap[c.user_id]?.trim() || `${c.user_id.slice(0, 8)}…`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-navy">
                        <Package className="h-3.5 w-3.5" />
                        {c.order_count}
                      </span>
                      <span className="font-medium text-gold">{formatPrice(c.total)}</span>
                    </div>
                    <div className="w-full text-xs text-muted-foreground sm:w-auto">
                      Последний заказ: {new Date(c.last_order_at).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                    ))}
                </div>
                <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-xs text-muted-foreground">
                    {clients.length === 0
                      ? "Клиентов нет"
                      : `Показано ${(clientsPage - 1) * CLIENTS_PER_PAGE + 1}–${Math.min(clientsPage * CLIENTS_PER_PAGE, clients.length)} из ${clients.length} клиентов`}
                  </p>
                  <Pagination
                    page={clientsPage}
                    totalPages={Math.max(1, Math.ceil(clients.length / CLIENTS_PER_PAGE))}
                    onPageChange={setClientsPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-navy">B2B-лиды</CardTitle>
            {leadsCount !== null && (
              <span className="text-sm text-muted-foreground">{leadsCount} заявок</span>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Заявки с раздела B2B от клиник и салонов. Обработка и контакты — в разделе B2B заявки.
            </p>
            <Link
              href="/dashboard/manager/leads"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
            >
              <Building2 className="h-4 w-4" />
              Перейти к B2B заявкам
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card mt-8">
        <CardHeader>
          <CardTitle className="text-lg text-navy">Управление заказами</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Полная таблица заказов с фильтрами и сменой статусов — на странице управления заказами.
          </p>
          <Link
            href="/dashboard/manager"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gold hover:underline"
          >
            Управление заказами
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
