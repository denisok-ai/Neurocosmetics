"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FlaskConical,
  ShieldCheck,
  Sun,
  Brain,
  Beaker,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestTubeChart } from "@/components/medtech/test-tube-chart";
import { Image3D } from "@/components/medtech/image-3d";
import { MicroneedlingAnimation } from "@/components/medtech/microneedling-animation";
import { AnimatedCounter } from "@/components/medtech/animated-counter";
import { getMarketplaces } from "@/lib/data/marketplaces";
import { useExperiment, EXPERIMENT_HERO_CTA } from "@/lib/ab";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeChild = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FAQ = [
  {
    q: "Почему сыворотку наносят на плечо, а не на лицо?",
    a: "Плечо выступает «входной точкой» для системного восстановления. Через микроканалы пептид попадает в кровоток, восполняя дефицит HAEE (~430 пг/мл). Кожа лица более чувствительна и часто имеет противопоказания для активного микронидлинга (розацеа).",
  },
  {
    q: "Как часто проводить процедуру?",
    a: "Рекомендуемый курс — 1 раз в 7–10 дней. Набор из 10 ампул рассчитан на 2–3 месяца применения.",
  },
  {
    q: "Нужно ли использовать SPF после процедуры?",
    a: "Да, обязательно. На следующее утро после процедуры необходимо нанести SPF 30+ на обработанную зону. Также в течение 24 часов избегайте сауны и бассейна.",
  },
  {
    q: "Безопасен ли HAEE?",
    a: "Доклинические исследования подтвердили отсутствие токсичности даже при дозах до 2000 мг/кг и отсутствие аллергических реакций. Продукт соответствует ТР ТС 009/2011.",
  },
  {
    q: "Когда нужно менять мезороллер?",
    a: "Мезороллер рекомендуется заменять через 10–15 процедур, так как иглы затупляются и перестают создавать качественные микроканалы.",
  },
];

export default function HomePage() {
  const { payload: heroCta, isLoading: heroCtaLoading } = useExperiment<{ ctaText: string }>(
    EXPERIMENT_HERO_CTA
  );

  return (
    <>
      {/* ===== 1. HERO ===== */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-[#FAFAFA] via-white to-[#FAFAFA]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_-20%,rgba(212,175,55,0.08),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-16">
            <div className="max-w-xl shrink-0 lg:flex-1">
              <motion.span
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="landing-badge"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Научная сенсация
              </motion.span>

              <motion.h1
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="typography-display mt-6"
              >
                Инновационная{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-navy">нейрокосметика</span>
                  <span className="absolute bottom-1 left-0 right-0 h-2 bg-gold/30 -skew-x-3" />
                </span>{" "}
                HAEE
              </motion.h1>

              <motion.p
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="typography-lead mt-6"
              >
                Инвестиция не только в уход за кожей, но и в{" "}
                <span className="font-semibold text-navy">эндогенный щит для мозга</span>.
              </motion.p>

              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gold text-navy font-semibold shadow-lg shadow-gold/20 transition-all hover:bg-gold-light hover:shadow-xl hover:shadow-gold/25"
                >
                  <Link href="/shop">
                    {heroCtaLoading ? "Купить курс" : heroCta.ctaText}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-navy/15 bg-white font-medium text-navy hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
                >
                  <Link href="#science">О науке</Link>
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
              className="relative flex shrink-0 items-start justify-center lg:flex-[1.1] lg:justify-end"
            >
              <div className="hero-product-card group relative aspect-square w-full max-w-md overflow-hidden rounded-2xl p-8">
                <Image3D
                  src="/images/haee-hero-product.png"
                  alt="HAEE — ампульная сыворотка и мезороллер"
                  width={480}
                  height={480}
                  className="h-full w-full object-contain object-center"
                  priority
                  tiltIntensity={14}
                  wrapperClassName="h-full w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 2. SCIENCE ===== */}
      <section id="science" className="section-landing bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="typography-h2">
              Дефицит <span className="landing-heading-accent">HAEE</span> — маркер нейродегенерации
            </h2>
            <p className="typography-lead mx-auto mt-4 max-w-2xl">
              Эндогенный пептид HAEE (Ac-His-Ala-Glu-Glu-NH2) — естественный компонент крови. Его концентрация снижается при нейродегенеративных заболеваниях.
            </p>
          </motion.div>

          <div className="mt-14">
            <TestTubeChart />
          </div>

          <div className="relative mt-14 h-px overflow-hidden bg-navy/5">
            <div className="animate-scan h-full w-1/3 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { value: 55, suffix: "%", label: "снижение амилоидных бляшек", sub: "против 30% у Alzhemed" },
              { value: 28.2, suffix: " млн", label: "потенциальных потребителей", sub: "рынок РФ", decimals: 1 },
              { value: 430, suffix: " пг/мл", label: "физиологическая норма HAEE", sub: "в плазме крови" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="landing-card text-center"
              >
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? 0}
                  className="typography-stat"
                />
                <p className="typography-body-sm mt-2 font-semibold text-navy">{stat.label}</p>
                <p className="typography-caption mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. PRODUCT ACTION ===== */}
      <section className="section-landing bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="typography-h2">
              Тройное действие <span className="landing-heading-accent">HAEE</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center"
          >
            <div className="landing-card overflow-hidden p-6">
              <Image3D
                src="/images/haee-product-box-mesoroller.png"
                alt="Ампульная сыворотка HAEE и косметический мезороллер"
                width={640}
                height={360}
                className="mx-auto h-auto w-full max-w-2xl object-contain"
                tiltIntensity={10}
                scaleOnHover={false}
                wrapperClassName="block w-full"
              />
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            {[
              {
                icon: ShieldCheck,
                title: "Антиоксидантная защита",
                desc: "Гистидиновый остаток хелатирует металлы-прооксиданты, нейтрализуя свободные радикалы.",
              },
              {
                icon: Sun,
                title: "Осветление пигментации",
                desc: "Специфическая регуляция тирозиназы обеспечивает выравнивание тона кожи.",
              },
              {
                icon: Brain,
                title: "Системная нейропротекция",
                desc: "Через трансдермальную доставку пептид попадает в кровоток и снижает амилоидные бляшки на 55%.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeChild}
                className="landing-card group text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10 transition-colors group-hover:bg-gold/20">
                  <item.icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="typography-h3 mt-5">{item.title}</h3>
                <p className="typography-body-sm mt-3">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 4. PROTOCOL ===== */}
      <section className="section-landing bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="typography-h2">
              Протокол <span className="landing-heading-accent">применения</span>
            </h2>
            <p className="typography-lead mx-auto mt-4 max-w-2xl">
              Пошаговая процедура для максимальной эффективности трансдермальной доставки пептида.
            </p>
          </motion.div>

          <div className="mt-16 grid items-center gap-16 lg:grid-cols-2">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                { step: 1, title: "Очищение", desc: "Очистите зону плеча мягким очищающим средством" },
                { step: 2, title: "Дезинфекция", desc: "Выдержите мезороллер в 70% изопропиловом спирте 5–10 минут" },
                { step: 3, title: "Нанесение", desc: "Нанесите 0,5–1,0 мл сыворотки из ампулы. Не втирайте!" },
                { step: 4, title: "Микронидлинг", desc: "Прокатка: горизонтально, вертикально, диагонально (по 4–6 раз)" },
                { step: 5, title: "Завершение", desc: "Подождите 3–5 минут для впитывания. SPF 30+ утром" },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeChild}
                  className="flex items-start gap-4 rounded-xl border border-navy/5 bg-[#FAFAFA]/50 p-4 transition-colors hover:border-gold/20 hover:bg-gold/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold font-serif text-lg font-bold text-navy">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy">{item.title}</h4>
                    <p className="typography-body-sm mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="flex justify-center">
              <MicroneedlingAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. SAFETY ===== */}
      <section className="section-landing bg-[#FAFAFA]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="typography-h2">
              Безопасность и <span className="landing-heading-accent">сертификация</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid gap-6 sm:grid-cols-2"
          >
            {[
              { icon: ShieldCheck, title: "Нет токсичности", desc: "Безопасность подтверждена при дозах до 2000 мг/кг в доклинических исследованиях" },
              { icon: CheckCircle2, title: "Нет аллергии", desc: "Эндогенный компонент крови — высокая биосовместимость" },
              { icon: Beaker, title: "ТР ТС 009/2011", desc: "Соответствие техническому регламенту парфюмерно-косметической продукции" },
              { icon: FlaskConical, title: "Патент РФ № 2826728", desc: "Защищённый способ восстановления дефицита эндогенного компонента" },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeChild}
                className="landing-card flex items-start gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <item.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="typography-h3">{item.title}</h3>
                  <p className="typography-body-sm mt-1.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 6. FAQ ===== */}
      <section className="section-landing bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="typography-h2">
              Частые <span className="landing-heading-accent">вопросы</span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 space-y-3"
          >
            {FAQ.map((item) => (
              <motion.details
                key={item.q}
                variants={fadeChild}
                className="group landing-card [&[open]_summary_svg]:rotate-180"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <span className="font-semibold text-navy">{item.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-gold transition-transform duration-200" />
                </summary>
                <p className="typography-body-sm mt-4 border-t border-navy/5 pt-4">
                  {item.a}
                </p>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== 7. WHERE TO BUY ===== */}
      <section className="section-landing-lg bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="typography-h2">
              Где <span className="landing-heading-accent">купить</span>
            </h2>
            <p className="typography-lead mx-auto mt-4 max-w-2xl">
              HAEE Neurocosmetics доступна на ведущих маркетплейсах России.
            </p>
          </motion.div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {getMarketplaces().map((m) => (
              <a
                key={m.id}
                href={m.href}
                className="landing-card typography-body-sm flex h-16 min-w-[140px] items-center justify-center gap-2 font-semibold text-navy/70 transition-colors hover:text-gold"
                title={m.isPlaceholder ? "Скоро" : m.name}
                {...(m.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <ShoppingBag className="h-4 w-4" />
                {m.name}
              </a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <Button
              asChild
              size="lg"
              className="bg-gold text-navy font-semibold shadow-lg shadow-gold/20 hover:bg-gold-light hover:shadow-xl"
            >
              <Link href="/shop">
                Купить на сайте <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
