"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { capturePayment } from "@/lib/api/payments";
import { useOrdersStore } from "@/lib/api/orders";

type Stage = "processing" | "3dsecure" | "capturing" | "success" | "error";

export default function ConfirmPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");
  const { updateStatus } = useOrdersStore();
  const [stage, setStage] = useState<Stage>("processing");

  useEffect(() => {
    if (!paymentId || !orderId) {
      setStage("error");
      return;
    }

    async function processPayment() {
      setStage("processing");
      await new Promise((r) => setTimeout(r, 1200));

      setStage("3dsecure");
      await new Promise((r) => setTimeout(r, 2000));

      setStage("capturing");
      await capturePayment(paymentId!);

      const confirmRes = await fetch(`/api/payments/confirm?order_id=${orderId}&payment_id=${paymentId}`, {
        method: "POST",
      });
      if (confirmRes.ok) {
        updateStatus(orderId!, "paid");
      }

      setStage("success");
    }

    processPayment();
  }, [paymentId, orderId]);

  const stages: Record<Stage, { icon: React.ElementType; text: string; color: string }> = {
    processing: { icon: CreditCard, text: "Подключение к ЮKassa...", color: "text-gold" },
    "3dsecure": { icon: ShieldCheck, text: "Проверка 3D Secure...", color: "text-blue-400" },
    capturing: { icon: Loader2, text: "Подтверждение платежа...", color: "text-gold" },
    success: { icon: CheckCircle2, text: "Оплата прошла успешно!", color: "text-emerald-400" },
    error: { icon: XCircle, text: "Ошибка обработки платежа", color: "text-red-400" },
  };

  const current = stages[stage];
  const Icon = current.icon;
  const isAnimating = stage !== "success" && stage !== "error";

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-24">
      <Card className="w-full border-white/5 bg-white/[0.03] backdrop-blur-sm">
        <CardContent className="flex flex-col items-center py-12">
          {/* YooKassa branding mock */}
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
            <span className="font-mono text-sm font-bold tracking-wider text-ice">
              Ю<span className="text-blue-400">Kassa</span>
            </span>
          </div>

          <Icon
            className={`h-16 w-16 ${current.color} ${isAnimating ? "animate-pulse" : ""}`}
          />

          <h2 className="mt-6 font-serif text-xl font-bold text-ice">
            {current.text}
          </h2>

          {stage === "3dsecure" && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Имитация проверки банковской карты...
            </p>
          )}

          {paymentId && stage !== "error" && (
            <p className="mt-3 font-mono text-xs text-white/30">
              Payment ID: {paymentId}
            </p>
          )}

          {/* Progress bar */}
          {isAnimating && (
            <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <div className="h-full animate-pulse rounded-full bg-gold/60" style={{
                width: stage === "processing" ? "33%" : stage === "3dsecure" ? "66%" : "90%",
                transition: "width 0.5s ease",
              }} />
            </div>
          )}

          {stage === "success" && (
            <div className="mt-8 flex gap-3">
              <Button
                onClick={() => router.push(`/dashboard/orders/${orderId}`)}
                className="bg-gold text-navy hover:bg-gold-light"
              >
                Перейти к заказу
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/shop")}
                className="border-white/10 text-muted-foreground hover:bg-white/5 hover:text-ice"
              >
                В магазин
              </Button>
            </div>
          )}

          {stage === "error" && (
            <Button
              onClick={() => router.push("/shop/cart")}
              className="mt-8 bg-gold text-navy hover:bg-gold-light"
            >
              Вернуться в корзину
            </Button>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
