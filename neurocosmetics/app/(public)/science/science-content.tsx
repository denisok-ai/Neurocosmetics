"use client";

import { motion } from "framer-motion";
import { Atom, FileText, Shield } from "lucide-react";
import { TestTubeChart } from "@/components/medtech/test-tube-chart";
import { AnimatedCounter } from "@/components/medtech/animated-counter";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeChild = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function ScienceContent() {
  return (
    <div className="bg-[#FAFAFA]">
      <section className="border-b border-border bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="typography-h1">
            Наука за <span className="text-gold">HAEE</span>
          </h1>
          <p className="typography-lead mt-4 max-w-2xl">
            Эндогенный пептид Ac-His-Ala-Glu-Glu-NH2 — результат многолетних исследований в области
            нейропротекции и косметологии.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="typography-h2">
              Дефицит <span className="text-gold">HAEE</span> — маркер нейродегенерации
            </h2>
            <p className="typography-lead mx-auto mt-4 max-w-2xl">
              Концентрация пептида в крови снижается при старении, стрессе и заболеваниях, связанных
              с нейровоспалением.
            </p>
          </motion.div>

          <div className="mt-16">
            <TestTubeChart />
          </div>

          <div className="relative mt-12 h-px w-full overflow-hidden bg-navy/5">
            <div className="animate-scan h-full w-1/3 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                value: 55,
                suffix: "%",
                label: "снижение амилоидных бляшек",
                sub: "против 30% у Alzhemed",
              },
              {
                value: 28.2,
                suffix: " млн",
                label: "потенциальных потребителей",
                sub: "рынок РФ",
                decimals: 1,
              },
              {
                value: 430,
                suffix: " пг/мл",
                label: "физиологическая норма HAEE",
                sub: "в плазме крови",
              },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6 text-center">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? 0}
                  className="typography-stat"
                />
                <p className="typography-body-sm mt-2 font-medium text-navy">{stat.label}</p>
                <p className="typography-caption mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            <motion.div variants={fadeChild} className="glass rounded-2xl p-6">
              <Atom className="mb-4 h-8 w-8 text-gold" />
              <h3 className="typography-h3">Механизм действия</h3>
              <p className="typography-body-sm mt-2">
                Трансдермальная доставка пептида мезороллером. Двойное действие: локальное
                осветление/омоложение и системная нейропротекция.
              </p>
            </motion.div>

            <motion.div variants={fadeChild} className="glass rounded-2xl p-6">
              <FileText className="mb-4 h-8 w-8 text-gold" />
              <h3 className="typography-h3">Патент RU 2826728</h3>
              <p className="typography-body-sm mt-2">
                Защищённая технология производства и применения. Соответствие TR CU 009/2011.
              </p>
            </motion.div>

            <motion.div variants={fadeChild} className="glass rounded-2xl p-6">
              <Shield className="mb-4 h-8 w-8 text-gold" />
              <h3 className="typography-h3">Клинические данные</h3>
              <p className="typography-body-sm mt-2">
                55% vs 30% блокировка амилоида. Доклинические результаты подтверждают эффективность.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
