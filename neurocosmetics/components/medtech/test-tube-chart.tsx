"use client";

import { motion } from "framer-motion";

const LAB_DATA = [
  { label: "Норма", value: 430, unit: "пг/мл", color: "#D4AF37", desc: "Физиологический уровень" },
  { label: "Постковид", value: 244, unit: "пг/мл", color: "#3b82f6", desc: "Постковидный синдром" },
  { label: "Альцгеймер", value: 74, unit: "пг/мл", color: "#1e3a8a", desc: "Болезнь Альцгеймера" },
];

const MAX_VALUE = 430;

export function TestTubeChart() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8 sm:gap-12">
      {LAB_DATA.map((item, idx) => {
        const fillPct = (item.value / MAX_VALUE) * 100;
        return (
          <div key={item.label} className="flex flex-col items-center gap-3">
            {/* Tube container */}
            <div className="glass-tube relative h-52 w-14 overflow-hidden rounded-b-[2rem] rounded-t-lg">
              {/* Graduation marks */}
              {[25, 50, 75].map((pct) => (
                <div
                  key={pct}
                  className="absolute left-0 right-0 border-t border-dashed border-navy/10"
                  style={{ bottom: `${pct}%` }}
                />
              ))}

              {/* Animated liquid fill */}
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                initial={{ height: 0 }}
                whileInView={{ height: `${fillPct}%` }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.25 }}
                style={{ backgroundColor: item.color }}
              >
                {/* Liquid surface highlight */}
                <div className="absolute top-0 left-0 h-1.5 w-full bg-white/25 blur-[1px]" />
                {/* Bubble effect */}
                <motion.div
                  className="absolute left-1/3 bottom-1/4 h-1.5 w-1.5 rounded-full bg-white/30"
                  animate={{ y: [-2, -8, -2] }}
                  transition={{ repeat: Infinity, duration: 2, delay: idx * 0.5 }}
                />
              </motion.div>

              {/* Tube neck */}
              <div className="absolute -top-1 left-1/2 h-3 w-6 -translate-x-1/2 rounded-t-sm border border-white/20 bg-white/5" />
            </div>

            {/* Value */}
            <motion.span
              className="text-lg font-bold"
              style={{ color: item.color }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 + idx * 0.25 }}
            >
              {item.value} {item.unit}
            </motion.span>

            {/* Label */}
            <span className="text-xs font-semibold uppercase tracking-wider text-navy/70">
              {item.label}
            </span>
            <span className="max-w-[120px] text-center text-[11px] text-muted-foreground">
              {item.desc}
            </span>
          </div>
        );
      })}
    </div>
  );
}
