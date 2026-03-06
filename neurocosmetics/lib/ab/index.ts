/**
 * @file index.ts
 * @description Публичный API модуля A/B-тестирования
 * @created 2025-03-06
 */

export { useExperiment } from "./use-experiment";
export {
  EXPERIMENTS,
  EXPERIMENT_HERO_CTA,
  type Experiment,
  type ExperimentId,
  type ExperimentVariant,
  type VariantId,
} from "./experiments";
export { getVariant, getOrCreateVisitorId, assignVariant } from "./variant";
