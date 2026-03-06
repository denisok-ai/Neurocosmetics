import { NextResponse } from "next/server";
import { getYooKassaWebhookSecret, isYooKassaConfigured, getYooKassaConfig } from "@/lib/config/payments";
import { paymentEventToOrderStatus, updateOrderStatusInSupabase } from "@/lib/api/order-status";
import { sendTelegramMessage } from "@/lib/api/notifications";
import { reportCriticalError } from "@/lib/api/monitoring";

const YOOKASSA_IPS = [
  "77.75.156.35",
  "77.75.156.11",
  "77.75.154.128",
  "185.71.77.0",
  "185.71.76.0",
];

function isYooKassaIp(ip: string | null): boolean {
  if (!ip) return false;
  return YOOKASSA_IPS.some((allowed) => ip === allowed || ip.startsWith(allowed.split(".")[0]!));
}

/**
 * YooKassa Webhook: при успехе/отмене платежа обновляет статус заказа в Supabase.
 * Проверки: X-Webhook-Secret (если задан), опционально IP, верификация статуса через API.
 * POST /api/payments/webhook
 */
export async function POST(req: Request) {
  try {
    const secret = getYooKassaWebhookSecret();
    if (secret) {
      const received = req.headers.get("x-webhook-secret");
      if (received !== secret) {
        return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
      }
    }

    const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
    const clientIp = (forwarded?.split(",")[0]?.trim()) ?? null;
    if (isYooKassaConfigured() && clientIp && !isYooKassaIp(clientIp)) {
      console.warn("[YooKassa Webhook] Unknown IP:", clientIp);
    }

    const body = await req.json();
    const event = (body.event as string) ?? "";
    const paymentId = body.object?.id as string;
    const orderId = body.object?.metadata?.order_id as string;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id in metadata" }, { status: 400 });
    }

    let status = paymentEventToOrderStatus(event);

    if (status && isYooKassaConfigured() && paymentId) {
      const { shopId, secretKey } = getYooKassaConfig();
      const auth = Buffer.from(`${shopId}:${secretKey}`).toString("base64");
      try {
        const apiRes = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
          headers: { Authorization: `Basic ${auth}` },
        });
        if (apiRes.ok) {
          const payment = await apiRes.json();
          const apiStatus = payment.status;
          if (apiStatus === "succeeded" && status === "paid") status = "paid";
          else if (apiStatus === "canceled" && status === "cancelled") status = "cancelled";
          else if (apiStatus !== "succeeded" && apiStatus !== "canceled") status = null;
        }
      } catch (e) {
        console.error("[YooKassa Webhook] API verification failed:", e);
      }
    }

    if (status) {
      const updated = await updateOrderStatusInSupabase(orderId, status);
      console.log(
        `[YooKassa Webhook] event=${event} payment=${paymentId} order=${orderId} status=${status} updated=${updated}`
      );
      if (status === "paid") {
        await sendTelegramMessage(`💰 <b>HAEE</b> — оплачен заказ <code>${orderId}</code>`);
      }
    } else {
      console.log(
        `[YooKassa Webhook] event=${event} payment=${paymentId} order=${orderId} (no status mapping)`
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (e) {
    await reportCriticalError(e, {
      source: "payments_webhook",
      details: { message: "Webhook processing failed" },
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
