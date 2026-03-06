/**
 * @file payments.ts
 * @description Конфигурация платёжного шлюза (YooKassa). При отсутствии ключей используется mock.
 * @created 2025-03-06
 */

export interface YooKassaConfig {
  shopId: string;
  secretKey: string;
}

/**
 * Проверяет, заданы ли в env учётные данные YooKassa (для переключения mock / real API).
 */
export function isYooKassaConfigured(): boolean {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  return Boolean(shopId?.trim() && secret?.trim());
}

/**
 * Возвращает конфиг YooKassa из env. Использовать только на сервере.
 * Если ключи не заданы, вернёт пустые строки — вызывающий код должен проверять isYooKassaConfigured().
 */
export function getYooKassaConfig(): YooKassaConfig {
  return {
    shopId: process.env.YOOKASSA_SHOP_ID ?? "",
    secretKey: process.env.YOOKASSA_SECRET_KEY ?? "",
  };
}

/** Секрет для проверки подписи webhook (опционально). */
export function getYooKassaWebhookSecret(): string | null {
  const s = process.env.YOOKASSA_WEBHOOK_SECRET;
  return s?.trim() ? s : null;
}
