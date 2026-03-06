/**
 * @file notifications.ts
 * @description Конфигурация каналов уведомлений: Telegram, Email (env)
 * @created 2025-03-06
 */

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface MailConfig {
  /** API ключ (например Resend) или признак использования SMTP */
  apiKey?: string;
  /** Адрес отправителя для писем */
  from: string;
}

/**
 * Конфиг для отправки в Telegram (Bot API: sendMessage).
 * Переменные: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
 */
export function getTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!botToken || !chatId) return null;
  return { botToken, chatId };
}

/**
 * Конфиг для отправки email (например через Resend).
 * Переменные: RESEND_API_KEY (или иной провайдер), NOTIFICATION_EMAIL_FROM.
 */
export function getMailConfig(): MailConfig | null {
  const from = process.env.NOTIFICATION_EMAIL_FROM?.trim();
  if (!from) return null;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return { from, ...(apiKey ? { apiKey } : {}) };
}

export function isTelegramConfigured(): boolean {
  return getTelegramConfig() != null;
}

export function isMailConfigured(): boolean {
  return getMailConfig() != null;
}
