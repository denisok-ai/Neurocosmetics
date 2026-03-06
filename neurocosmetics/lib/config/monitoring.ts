/**
 * @file monitoring.ts
 * @description Конфигурация мониторинга: Sentry, алерты, health check
 * @created 2025-03-06
 */

export interface MonitoringConfig {
  /** Sentry DSN для error tracking (опционально) */
  sentryDsn?: string;
  /** Включить алерты в Telegram при критических ошибках */
  alertOnCritical: boolean;
  /** Chat ID для алертов (если отличается от TELEGRAM_CHAT_ID) */
  alertChatId?: string;
}

/**
 * Конфиг мониторинга из env.
 * SENTRY_DSN — для будущей интеграции Sentry.
 * MONITORING_ALERT_ON_CRITICAL — true по умолчанию, отправлять алерты в Telegram.
 */
export function getMonitoringConfig(): MonitoringConfig {
  const sentryDsn = process.env.SENTRY_DSN?.trim();
  const alertOnCritical = process.env.MONITORING_ALERT_ON_CRITICAL !== "false";
  const alertChatId = process.env.MONITORING_ALERT_CHAT_ID?.trim();

  return {
    ...(sentryDsn ? { sentryDsn } : {}),
    alertOnCritical,
    ...(alertChatId ? { alertChatId } : {}),
  };
}

export function isMonitoringConfigured(): boolean {
  const cfg = getMonitoringConfig();
  return Boolean(cfg.sentryDsn || cfg.alertOnCritical);
}
