import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import Buddy from "../characters/Buddy";
import { FREE_PAGES, money, offers } from "../shop/pricing";
import { Button, Reveal, SectionHead } from "./ui";

/** Free to create, pay only to keep: the three ways to take a story home. */
export default function Pricing() {
  const { t } = useLanguage();
  const { openBuilder } = useStory();

  return (
    <section id="pricing" className="relative scroll-mt-24 overflow-hidden bg-bubble/25 px-5 py-24 sm:py-32">
      <div className="absolute -start-4 top-20 hidden w-28 rotate-12 lg:block">
        <Buddy id="pinso" mood="happy" />
      </div>
      <SectionHead kicker={`💛 ${t("price.kicker")}`} color="bg-sun" title={t("price.title")} sub={t("price.sub", { n: FREE_PAGES })} />

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
        {offers.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 50, rotate: i === 1 ? 0 : i ? 4 : -4 }}
            whileInView={{ opacity: 1, y: o.popular ? -12 : 0, rotate: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 140, damping: 16, delay: i * 0.1 }}
            whileHover={{ y: o.popular ? -20 : -8 }}
            className={`relative flex flex-col rounded-[2rem] border-2 border-ink p-6 ${o.popular ? `${o.color} shadow-pop-lg` : "bg-paper shadow-pop"}`}
          >
            {o.popular && (
              <span className="absolute -top-4 start-6 -rotate-3 rounded-full border-2 border-ink bg-coral px-3 py-1 font-display text-sm font-semibold shadow-pop-sm">
                ⭐ {t("offer.popular")}
              </span>
            )}
            <span className="text-5xl">{o.emoji}</span>
            <h3 className="mt-3 font-display text-2xl font-bold">{t(`offer.${o.id}.name`)}</h3>
            <p className="font-semibold text-ink/65">{t(`offer.${o.id}.desc`)}</p>
            <p className="mt-4 font-display text-4xl font-bold" dir="ltr">
              {money(o.price)}
            </p>
            <p className="text-sm font-bold text-ink/55">{t(`offer.${o.id}.unit`, { shipping: money(o.shipping), each: money(o.price / (o.credits + 1)) })}</p>
            <ul className="mt-5 flex-1 space-y-2">
              {t(`offer.${o.id}.f`).split("|").map((feat) => (
                <li key={feat} className="flex items-start gap-2 font-semibold text-ink/85">
                  <Check className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={3} />
                  {feat}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <Reveal className="mt-12 text-center">
        <Button variant="ink" size="lg" onClick={openBuilder}>
          {t("price.cta")}
          <ArrowRight className="h-5 w-5 rtl:rotate-180" />
        </Button>
        <p className="mt-4 text-sm font-bold text-ink/60">{t("price.note")}</p>
      </Reveal>
    </section>
  );
}
