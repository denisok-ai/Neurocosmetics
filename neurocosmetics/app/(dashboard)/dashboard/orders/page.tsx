"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { useOrdersStore } from "@/lib/api/orders";

const ORDERS_PER_PAGE = 10;
import { formatPrice } from "@/lib/api/payments";
import type { OrderStatus } from "@/lib/types";

const STATUS_MAP: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Ожидает оплаты", variant: "outline" },
  paid: { label: "Оплачен", variant: "secondary" },
  shipped: { label: "В доставке", variant: "default" },
  delivered: { label: "Доставлен", variant: "secondary" },
  cancelled: { label: "Отменён", variant: "destructive" },
};

export default function OrdersPage() {
  const { orders, fetchOrders } = useOrdersStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders("mine");
  }, [fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(
    () => orders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE),
    [orders, page]
  );

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/30" />
        <h1 className="mt-6 font-serif text-3xl font-bold text-navy">
          Заказов пока нет
        </h1>
        <p className="mt-3 text-muted-foreground">
          Оформите первый заказ в нашем магазине.
        </p>
        <Button asChild className="mt-8 bg-gold text-navy hover:bg-gold-light">
          <Link href="/shop">В магазин</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Мои заказы</h1>
      <p className="mt-2 text-muted-foreground">
        История ваших заказов и текущие доставки.
      </p>

      <div className="mt-8 space-y-4">
        {paginatedOrders.map((order) => {
          const statusInfo = STATUS_MAP[order.status];
          return (
            <Card key={order.id} className="dashboard-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                  <Package className="h-5 w-5 text-gold" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-muted-foreground">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {order.items.map((i) => i.product_name).join(", ")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <span className="font-serif text-lg font-bold text-gold">
                  {formatPrice(order.total)}
                </span>

                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-gold/5 hover:text-gold"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          Показано {(page - 1) * ORDERS_PER_PAGE + 1}–{Math.min(page * ORDERS_PER_PAGE, orders.length)} из {orders.length} заказов
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
