"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/api/cart";
import { useOrdersStore } from "@/lib/api/orders";
import { createPayment, formatPrice } from "@/lib/api/payments";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validation/schemas";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { updateStatus } = useOrdersStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (items.length === 0 && !success) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-ice">
          Нет товаров для оформления
        </h1>
        <Button
          asChild
          className="mt-8 bg-gold text-navy hover:bg-gold-light"
        >
          <Link href="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />В магазин
          </Link>
        </Button>
      </section>
    );
  }

  if (success) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
        <h1 className="mt-6 font-serif text-3xl font-bold text-ice">
          Заказ оформлен!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Мы отправим подтверждение на вашу почту. Статус заказа можно
          отслеживать в личном кабинете.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button
            asChild
            variant="outline"
            className="border-white/10 text-muted-foreground hover:bg-white/5 hover:text-ice"
          >
            <Link href="/shop">В магазин</Link>
          </Button>
          <Button
            asChild
            className="bg-gold text-navy hover:bg-gold-light"
          >
            <Link href="/dashboard/orders">Мои заказы</Link>
          </Button>
        </div>
      </section>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw: CheckoutFormData = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      comment: (formData.get("comment") as string) || undefined,
    };

    const result = checkoutSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const orderPayload = {
      items: items.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
    };

    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}));
      setErrors({ form: err.error ?? "Ошибка создания заказа. Войдите в аккаунт." });
      setLoading(false);
      return;
    }

    const order = await orderRes.json();

    const payment = await createPayment({
      order_id: order.id,
      amount: order.total,
      description: `Заказ ${order.id}`,
      return_url: `${window.location.origin}/dashboard/orders/${order.id}`,
    });

    clearCart();

    if (payment.confirmation) {
      router.push(payment.confirmation.confirmation_url);
      return;
    }

    updateStatus(order.id, "paid");
    setLoading(false);
    setSuccess(true);
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
      <Link
        href="/shop/cart"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-ice"
      >
        <ArrowLeft className="h-4 w-4" />
        Вернуться в корзину
      </Link>

      <h1 className="font-serif text-3xl font-bold text-gold">
        Оформление заказа
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
          <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-ice">Контактные данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Имя и фамилия</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Иван Иванов"
                  className="mt-1 border-white/10 bg-white/5"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="mt-1 border-white/10 bg-white/5"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+7 (999) 123-45-67"
                    className="mt-1 border-white/10 bg-white/5"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-ice">Доставка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Адрес доставки</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="г. Москва, ул. Примерная, д. 1, кв. 2"
                  className="mt-1 border-white/10 bg-white/5"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-400">{errors.address}</p>
                )}
              </div>
              <div>
                <Label htmlFor="comment">Комментарий к заказу</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  placeholder="Домофон, этаж, удобное время доставки..."
                  className="mt-1 border-white/10 bg-white/5"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full bg-gold text-navy hover:bg-gold-light"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            {loading ? "Обработка..." : `Оплатить ${formatPrice(total())}`}
          </Button>
        </form>

        <aside className="lg:col-span-2">
          <Card className="sticky top-24 border-white/5 bg-white/[0.03] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-ice">Ваш заказ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex-1 text-muted-foreground">
                    {item.product.name}{" "}
                    <span className="text-white/40">x{item.quantity}</span>
                  </span>
                  <span className="font-mono text-ice">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Итого</span>
                <span className="font-serif text-xl font-bold text-gold">
                  {formatPrice(total())}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
