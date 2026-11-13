import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import Buddy, { BUDDY_IDS, Speech, type BuddyId } from "../characters/Buddy";
import { Confetti, SectionHead } from "./ui";

const tiles = ["bg-sun", "bg-sky", "bg-bubble", "bg-mint", "bg-coral", "bg-sun", "bg-sky", "bg-mint", "bg-bubble"];

/** Meet the cast — and tickle every one of them. */
export default function Crew() {
  const { t } = useLanguage();
  const { data } = useStory();
  const [tickled, setTickled] = useState<BuddyId[]>([]);
  const [talking, setTalking] = useState<BuddyId | null>(null);
  const name = data.childName.trim() || t("common.yourChildLower");
  const all = tickled.length === BUDDY_IDS.length;

  useEffect(() => {
    if (!talking) return;
    const id = setTimeout(() => setTalking(null), 2600);
    return () => clearTimeout(id);
  }, [talking, tickled.length]);

  const poke = (id: BuddyId) => {
    setTalking(id);
    setTickled((list) => (list.includes(id) ? list : [...list, id]));
  };

  return (
    <section id="crew" className="relative scroll-mt-24 overflow-hidden bg-mint/30 px-5 py-24 sm:py-32">
      <SectionHead kicker={`👋 ${t("crew.kicker")}`} color="bg-bubble" title={t("crew.title")} sub={t("crew.sub")} />

      <div className="relative mx-auto mt-8 flex max-w-md justify-center">
        {all && <Confetti count={36} />}
        <motion.div
          key={tickled.length}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
          className="rounded-full border-2 border-ink bg-paper px-5 py-2 font-display font-semibold shadow-pop-sm"
        >
          {all ? `🎉 ${t("crew.done")}` : `⭐ ${t("crew.count", { n: tickled.length, total: BUDDY_IDS.length })}`}
        </motion.div>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-3 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-9 lg:gap-x-3">
        {BUDDY_IDS.map((id, i) => {
          const done = tickled.includes(id);
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 40, scale: 0.7 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: i * 0.06 }}
              className="relative flex flex-col items-center text-center"
            >
              <AnimatePresence>
                {talking === id && (
                  <div className="absolute -top-4 z-20 w-40 -translate-y-full sm:w-44">
                    <Speech tail="bottom" className="px-3 py-2 text-sm">
                      {t(`buddy.${id}.poke`, { name })}
                    </Speech>
                  </div>
                )}
              </AnimatePresence>
              <div className={`relative flex aspect-square w-full items-end justify-center rounded-3xl border-2 border-ink shadow-pop-sm ${tiles[i]}`}>
                <div className="w-[88%]">
                  <Buddy id={id} onPoke={() => poke(id)} label={t(`buddy.${id}.name`)} />
                </div>
                {done && (
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -end-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-paper text-sm"
                  >
                    ⭐
                  </motion.span>
                )}
              </div>
              <span className="mt-2 font-display text-lg font-semibold leading-tight">{t(`buddy.${id}.name`)}</span>
              <span className="text-xs font-bold text-ink/60">{t(`buddy.${id}.role`)}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
