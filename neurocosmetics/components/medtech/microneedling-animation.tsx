"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  { key: "horizontal", label: "Горизонтально", repeats: 5 },
  { key: "vertical", label: "Вертикально", repeats: 5 },
  { key: "diagonal", label: "Диагонально", repeats: 3 },
] as const;

const pathVariants = {
  horizontal: { x: [-28, 28, -28], y: 0, rotate: 0 },
  vertical: { x: 0, y: [-28, 28, -28], rotate: 90 },
  diagonal: { x: [-22, 22, -22], y: [-22, 22, -22], rotate: 45 },
};

export function MicroneedlingAnimation() {
  const controls = useAnimation();
  const [step, setStep] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function runProtocol() {
      while (!cancelled) {
        for (let i = 0; i < STEPS.length; i++) {
          if (cancelled) return;
          setStep(i);
          const s = STEPS[i];
          await controls.start({
            ...pathVariants[s.key],
            transition: { repeat: s.repeats, duration: 1.4, ease: "linear" },
          });
        }
      }
    }

    runProtocol();
    return () => {
      cancelled = true;
    };
  }, [controls]);

  const currentStep = STEPS[step];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Step indicator */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              i === step ? "bg-gold text-navy" : "bg-navy/5 text-navy/40"
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Shoulder zone */}
      <div className="relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-navy/15 bg-gradient-to-br from-blue-50/60 to-white/40">
        {/* Target zone label */}
        <span className="absolute top-3 text-[10px] font-medium uppercase tracking-widest text-navy/30">
          Зона плеча
        </span>

        {/* Roller */}
        <motion.div
          animate={controls}
          className="relative flex h-18 w-11 items-center justify-center rounded-lg border border-gold/40 bg-gradient-to-b from-gold/80 to-gold-dark/90 shadow-lg"
        >
          {/* Needles grid */}
          <div className="grid grid-cols-3 gap-0.5 p-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-white/60" />
            ))}
          </div>
          {/* Glow */}
          <div className="absolute -bottom-1.5 h-3 w-full rounded-full bg-gold/30 blur-md" />
        </motion.div>

        {/* Microchannel grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, #0B132B 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />
      </div>

      <p className="max-w-[220px] text-center text-xs text-muted-foreground">
        Каждая точка кожи обрабатывается {currentStep.label.toLowerCase()} —{" "}
        {currentStep.key === "diagonal" ? "2–4" : "4–6"} раз
      </p>
    </div>
  );
}
