/**
 * @file page.tsx
 * @description Страница корзины — UI на Zustand store
 * @dependencies lib/api/cart, shadcn/ui, lucide-react
 * @created 2025-03-05
 */

"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/api/cart";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl bg-[#FAFAFA] px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-6 font-serif text-3xl font-bold text-navy">Корзина пуста</h1>
        <p className="mt-3 text-muted-foreground">
          Добавьте товары из магазина, чтобы оформить заказ.
        </p>
        <Button asChild className="mt-8 bg-gold text-navy hover:bg-gold-light">
          <Link href="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />В магазин
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl bg-[#FAFAFA] px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-navy">Корзина</h1>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <Card key={item.product.id} className="border border-border bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <h3 className="font-semibold text-navy">{item.product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.product.price.toLocaleString("ru-RU")} ₽ / шт.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-mono text-sm text-navy">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="w-28 text-right font-mono text-sm font-semibold text-gold">
                {(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽
              </span>

              <button
                type="button"
                onClick={() => removeItem(item.product.id)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-6 bg-border" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Итого</p>
          <p className="font-serif text-2xl font-bold text-gold">
            {total().toLocaleString("ru-RU")} ₽
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={clearCart}
            className="border-border text-muted-foreground hover:bg-navy/5 hover:text-navy"
          >
            Очистить
          </Button>
          <Button asChild className="bg-gold text-navy hover:bg-gold-light">
            <Link href="/shop/checkout">Оформить заказ</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
