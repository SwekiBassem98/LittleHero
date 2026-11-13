import { motion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import Buddy from "../characters/Buddy";
import { SectionHead } from "./ui";

const cards = [
  { emoji: "🙈", color: "bg-mint" },
  { emoji: "📝", color: "bg-sun" },
  { emoji: "📱", color: "bg-sky" },
  { emoji: "🧸", color: "bg-bubble" },
];

export default function Trust() {
  const { t } = useLanguage();
  return (
    <section id="privacy" className="relative scroll-mt-24 overflow-hidden bg-ink px-5 py-24 sm:py-32">
      <div className="dots pointer-events-none absolute inset-0 opacity-30 invert" />

      <div className="relative">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 140, damping: 14 }}
          className="mx-auto mb-4 w-24"
        >
          <Buddy id="champi" mood="happy" />
        </motion.div>
        <SectionHead light color="bg-mint" kicker={`🛡️ ${t("trust.kicker")}`} title={t("trust.title")} sub={t("trust.sub")} />

        <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, rotate: i % 2 ? 6 : -6 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 130, damping: 15, delay: i * 0.09 }}
              whileHover={{ y: -8, rotate: i % 2 ? 2 : -2 }}
              className={`rounded-3xl border-2 border-ink p-6 text-ink shadow-[5px_5px_0_0_rgba(255,255,255,0.9)] ${c.color}`}
            >
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-paper text-3xl"
                whileInView={{ scale: [0.4, 1.2, 1] }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.09, duration: 0.5 }}
              >
                {c.emoji}
              </motion.div>
              <h3 className="mt-4 font-display text-xl font-semibold">{t(`trust.${i + 1}.title`)}</h3>
              <p className="mt-2 font-semibold text-ink/75">{t(`trust.${i + 1}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
