/**
 * @file monitoring.ts
 * @description Алерты при критических ошибках: Telegram, логирование
 * @created 2025-03-06
 */

import { sendTelegramMessage } from "@/lib/api/notifications";
import { getMonitoringConfig } from "@/lib/config/monitoring";

export interface CriticalErrorContext {
  /** Краткое описание (например: "webhook", "order_status") */
  source: string;
  /** Дополнительные данные для отладки */
  details?: Record<string, unknown>;
}

/**
 * Отправляет алерт о критической ошибке в Telegram (если настроено).
 * Не выбрасывает исключений — только логирует.
 */
export async function reportCriticalError(
  error: unknown,
  context: CriticalErrorContext
): Promise<void> {
  const config = getMonitoringConfig();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[monitoring] Critical error:", context.source, message, context.details);

  if (config.alertOnCritical) {
    const text = [
      "🚨 <b>HAEE Portal — критическая ошибка</b>",
      "",
      `<b>Источник:</b> ${escapeHtml(context.source)}`,
      `<b>Ошибка:</b> ${escapeHtml(message.slice(0, 500))}`,
      ...(context.details && Object.keys(context.details).length > 0
        ? [`<b>Детали:</b> <pre>${escapeHtml(JSON.stringify(context.details, null, 2).slice(0, 500))}</pre>`]
        : []),
      ...(stack ? [`<b>Stack:</b> <pre>${escapeHtml(stack.slice(0, 800))}</pre>`] : []),
    ].join("\n");

    await sendTelegramMessage(text, {
      ...(config.alertChatId ? { chatId: config.alertChatId } : {}),
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
