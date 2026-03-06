/**
 * @file notifications.ts
 * @description Отправка уведомлений: Telegram (Bot API), Email (Resend или mock)
 * @created 2025-03-06
 */

import { getTelegramConfig, getMailConfig } from "@/lib/config/notifications";

const TELEGRAM_API = "https://api.telegram.org";
const RESEND_API = "https://api.resend.com";

export interface SendTelegramOptions {
  disableWebPagePreview?: boolean;
  /** Переопределить chat_id (для алертов в отдельный канал) */
  chatId?: string;
}

/**
 * Отправляет сообщение в Telegram (Bot API sendMessage).
 * При отсутствии TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID — no-op, возвращает false.
 */
export async function sendTelegramMessage(
  text: string,
  options?: SendTelegramOptions
): Promise<boolean> {
  const config = getTelegramConfig();
  if (!config) {
    if (process.env.NODE_ENV === "development") {
      console.log("[notifications] Telegram not configured, skip:", text.slice(0, 80));
    }
    return false;
  }
  try {
    const url = `${TELEGRAM_API}/bot${config.botToken}/sendMessage`;
    const body = {
      chat_id: options?.chatId ?? config.chatId,
      text: text.slice(0, 4096),
      parse_mode: "HTML",
      disable_web_page_preview: options?.disableWebPagePreview ?? true,
    };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[notifications] Telegram API error:", res.status, err);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[notifications] sendTelegramMessage failed:", e);
    return false;
  }
}

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  /** HTML-тело (опционально, иначе используется text) */
  html?: string;
}

/**
 * Отправляет email. При наличии RESEND_API_KEY — через Resend, иначе mock (логирование).
 * NOTIFICATION_EMAIL_FROM должен быть задан для отправки.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const config = getMailConfig();
  if (!config) {
    if (process.env.NODE_ENV === "development") {
      console.log("[notifications] Mail not configured, skip:", params.subject);
    }
    return false;
  }
  if (config.apiKey) {
    try {
      const res = await fetch(`${RESEND_API}/emails`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.from,
          to: [params.to],
          subject: params.subject,
          text: params.text,
          ...(params.html ? { html: params.html } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[notifications] Resend API error:", res.status, err);
        return false;
      }
      return true;
    } catch (e) {
      console.error("[notifications] sendEmail failed:", e);
      return false;
    }
  }
  if (process.env.NODE_ENV === "development") {
    console.log("[notifications] Mail mock:", { from: config.from, ...params });
  }
  return true;
}
