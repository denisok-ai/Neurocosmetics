/**
 * @file experiments.ts
 * @description Конфигурация A/B-экспериментов
 * @created 2025-03-06
 */

export type VariantId = "A" | "B";

export interface ExperimentVariant<T = unknown> {
  id: VariantId;
  /** Полезная нагрузка для варианта (текст, конфиг и т.д.) */
  payload: T;
}

export interface Experiment<T = unknown> {
  id: string;
  variants: [ExperimentVariant<T>, ExperimentVariant<T>];
}

/**
 * Демо-эксперимент: текст CTA-кнопки в Hero.
 * A: «Купить курс» (контроль), B: «Начать курс» (тест).
 */
export const EXPERIMENT_HERO_CTA = "hero_cta" as const;

export const EXPERIMENTS = {
  [EXPERIMENT_HERO_CTA]: {
    id: EXPERIMENT_HERO_CTA,
    variants: [
      { id: "A" as const, payload: { ctaText: "Купить курс" } },
      { id: "B" as const, payload: { ctaText: "Начать курс" } },
    ],
  },
} satisfies Record<string, Experiment<{ ctaText: string }>>;

export type ExperimentId = keyof typeof EXPERIMENTS;
