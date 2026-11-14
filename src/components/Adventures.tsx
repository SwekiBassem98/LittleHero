import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import { themes } from "../data";
import Buddy from "../characters/Buddy";
import Scene from "../story/Scene";
import { Button, Reveal, SectionHead } from "./ui";
import { cn } from "../utils/cn";

/** Pick a world: its animated scene plays, with the child's own avatar in it. */
export default function Adventures() {
  const { t } = useLanguage();
  const { data, update, openBuilder } = useStory();
  const [localId, setLocalId] = useState(themes[0].id);
  const activeId = data.themeId || localId;
  const theme = themes.find((x) => x.id === activeId)!;
  const name = data.childName.trim();
  const storyName = name || t("common.yourChild");

  const pick = (id: string) => {
    setLocalId(id);
    if (data.themeId) update("themeId", id);
  };

  const choose = () => {
    update("themeId", activeId);
    openBuilder();
  };

  return (
    <section id="adventures" className="scroll-mt-24 bg-sun/35 px-5 py-24 sm:py-32">
      <SectionHead
        kicker={t("adv.kicker")}
        color="bg-coral"
        title={t("adv.title", { name: name || t("common.yourChildLower") })}
        sub={t("adv.sub")}
      />

      <div className="mx-auto mt-14 grid max-w-6xl items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          {themes.map((th, i) => {
            const active = th.id === activeId;
            return (
              <motion.button
                key={th.id}
                onClick={() => pick(th.id)}
                aria-pressed={active}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.05 }}
                whileHover={{ y: -4, rotate: i % 2 ? 1.5 : -1.5 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-2xl border-2 border-ink p-2.5 text-start transition-shadow",
                  active ? "bg-ink text-white shadow-pop" : "bg-paper shadow-pop-sm"
                )}
              >
                <span
                  className="flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-xl border-2 border-ink"
                  style={{ background: `linear-gradient(150deg, ${th.from}, ${th.to})` }}
                >
                  <span className="block w-12 translate-y-1">
                    <Buddy id={th.buddy} mood={active ? "happy" : "idle"} pokable={false} watch={false} />
                  </span>
                </span>
                <span className="font-display text-[15px] font-semibold leading-tight">
                  {t(`theme.${th.id}.title`, { name: name || t("common.heroWord") })}
                </span>
                {active && (
                  <motion.span layoutId="adv-check" className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-mint text-ink">
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        <Reveal>
          <div className="relative">
            <div className="absolute inset-0 translate-x-2 translate-y-3 rounded-[2rem] border-2 border-ink bg-ink" />
            <div className="relative rounded-[2rem] border-2 border-ink bg-paper p-3 sm:p-4">
              <Scene themeId={theme.id} beat="friend" avatar={data.avatar} />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.22 }}
                  className="px-2 pb-2 pt-5 sm:px-4"
                >
                  <p className="font-semibold text-ink/60">{t(`theme.${theme.id}.tagline`)}</p>
                  <p className="mt-2 font-display text-xl leading-relaxed sm:text-2xl">
                    {t(`theme.${theme.id}.snippet`, { name: storyName })}
                  </p>
                  <Button variant="coral" className="mt-5 w-full sm:w-auto" onClick={choose}>
                    {t("adv.cta")}
                    <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
