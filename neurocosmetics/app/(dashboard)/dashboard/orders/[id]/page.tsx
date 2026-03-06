"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrdersStore } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/payments";
import type { OrderStatus } from "@/lib/types";

const TIMELINE_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "pending", label: "Создан", icon: Clock },
  { status: "paid", label: "Оплачен", icon: CreditCard },
  { status: "shipped", label: "В доставке", icon: Truck },
  { status: "delivered", label: "Доставлен", icon: CheckCircle2 },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

function getStepState(
  current: OrderStatus,
  step: OrderStatus
): "completed" | "active" | "upcoming" {
  if (current === "cancelled") return step === "pending" ? "active" : "upcoming";
  const ci = STATUS_ORDER.indexOf(current);
  const si = STATUS_ORDER.indexOf(step);
  if (si < ci) return "completed";
  if (si === ci) return "active";
  return "upcoming";
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { fetchOrders } = useOrdersStore();
  const order = useOrdersStore((s) => s.getOrder(id));

  useEffect(() => {
    fetchOrders("mine");
  }, [fetchOrders]);

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-serif text-3xl font-bold text-navy">
          Заказ не найден
        </h1>
        <Button
          asChild
          className="mt-6 bg-gold text-navy hover:bg-gold-light"
        >
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />К заказам
          </Link>
        </Button>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Все заказы
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="font-serif text-3xl font-bold text-navy">
          Заказ #{order.id.slice(-6).toUpperCase()}
        </h1>
        {isCancelled && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Отменён
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        от{" "}
        {new Date(order.created_at).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      {/* Timeline */}
      {!isCancelled && (
        <div className="mt-8 flex items-center justify-between">
          {TIMELINE_STEPS.map((step, idx) => {
            const state = getStepState(order.status, step.status);
            const Icon = step.icon;
            return (
              <div key={step.status} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      state === "completed"
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-600"
                        : state === "active"
                          ? "border-gold bg-gold/20 text-gold"
                          : "border-navy/10 bg-navy/5 text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-xs ${
                      state === "upcoming"
                        ? "text-muted-foreground"
                        : "text-navy"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`mx-3 h-0.5 w-16 sm:w-24 ${
                      getStepState(order.status, STATUS_ORDER[idx + 1]) !== "upcoming"
                        ? "bg-emerald-500/50"
                        : "bg-navy/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Items */}
      <Card className="dashboard-card mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy">
            <Package className="h-5 w-5 text-gold" />
            Состав заказа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">
                {item.product_name}{" "}
                <span className="text-navy/60">x{item.quantity}</span>
              </span>
              <span className="font-mono text-navy">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <Separator className="bg-navy/10" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Итого</span>
            <span className="font-serif text-xl font-bold text-gold">
              {formatPrice(order.total)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
