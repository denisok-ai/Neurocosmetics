"use client";

/**
 * @file use-experiment.ts
 * @description Хук для A/B-экспериментов на клиенте
 * @created 2025-03-06
 */

import { useState, useEffect } from "react";
import { EXPERIMENTS, type ExperimentId, type VariantId, type ExperimentVariant } from "./experiments";
import { getVariant } from "./variant";

export interface UseExperimentResult<T> {
  variant: VariantId;
  payload: T;
  isLoading: boolean;
}

/**
 * Возвращает текущий вариант эксперимента и его payload.
 * Вариант назначается при первом визите и сохраняется в cookie.
 */
export function useExperiment<T>(experimentId: ExperimentId): UseExperimentResult<T> {
  const [variant, setVariant] = useState<VariantId | null>(null);

  useEffect(() => {
    const v = getVariant(experimentId);
    setVariant(v);
  }, [experimentId]);

  const exp = EXPERIMENTS[experimentId];
  if (!exp) {
    throw new Error(`Unknown experiment: ${experimentId}`);
  }

  const v = variant ?? "A";
  const chosen = exp.variants.find((x) => x.id === v) ?? exp.variants[0]!;

  return {
    variant: v,
    payload: chosen.payload as T,
    isLoading: variant === null,
  };
}
