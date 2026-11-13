import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import Buddy, { type BuddyId } from "../characters/Buddy";
import { Button, Reveal, SectionHead } from "./ui";

const steps: { buddy: BuddyId; color: string; tilt: number }[] = [
  { buddy: "lumi", color: "bg-sun", tilt: -2 },
  { buddy: "zap", color: "bg-mint", tilt: 1.5 },
  { buddy: "trixie", color: "bg-sky", tilt: -1.5 },
  { buddy: "nour", color: "bg-bubble", tilt: 2 },
];

export default function HowItWorks() {
  const { t, isRTL } = useLanguage();
  const { openBuilder } = useStory();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 85%", "end 55%"] });
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <section id="how" className="scroll-mt-24 px-5 py-24 sm:py-32">
      <SectionHead kicker={t("how.kicker")} title={t("how.title")} sub={t("how.sub")} />

      <div ref={trackRef} className="relative mx-auto mt-16 max-w-6xl">
        {/* The path fills in as you scroll through the steps */}
        <div className="absolute inset-x-8 top-12 hidden h-2 rounded-full bg-ink/10 lg:block">
          <motion.div className="h-full rounded-full bg-coral" style={{ scaleX: line, originX: isRTL ? 1 : 0 }} />
        </div>
        <div className="absolute inset-y-4 start-11 w-2 rounded-full bg-ink/10 lg:hidden">
          <motion.div className="h-full w-full rounded-full bg-coral" style={{ scaleY: line, originY: 0 }} />
        </div>

        <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
          {steps.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 50, rotate: s.tilt * 3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 140, damping: 16, delay: i * 0.1 }}
              className="flex gap-5 lg:block"
            >
              <div className={`relative z-10 flex h-24 w-24 shrink-0 items-end justify-center rounded-3xl border-2 border-ink shadow-pop ${s.color}`}>
                <div className="w-20">
                  <Buddy id={s.buddy} />
                </div>
                <span className="absolute -end-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-ink font-display text-sm font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 rounded-3xl border-2 border-ink bg-paper p-5 shadow-pop-sm lg:mt-6" style={{ rotate: `${s.tilt * 0.4}deg` }}>
                <h3 className="font-display text-xl font-semibold">{t(`how.${i + 1}.title`)}</h3>
                <p className="mt-2 text-ink/70">{t(`how.${i + 1}.desc`)}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      <Reveal className="mt-14 text-center" delay={0.1}>
        <Button variant="ink" size="lg" onClick={openBuilder}>
          {t("how.cta")}
          <ArrowRight className="h-5 w-5 rtl:rotate-180" />
        </Button>
      </Reveal>
    </section>
  );
}
