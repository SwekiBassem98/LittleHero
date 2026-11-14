import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import Buddy, { Speech, type Mood } from "../characters/Buddy";

const sections = ["top", "how", "crew", "adventures", "library", "pricing", "privacy", "faq"];
const moods: Record<string, Mood> = { top: "happy", how: "idle", crew: "happy", adventures: "wow", library: "happy", pricing: "happy", privacy: "idle", faq: "think" };

/**
 * Lumi walks down the page with the parent: she sits in the corner,
 * comments on each section, and answers back when poked.
 */
export default function ScrollGuide() {
  const { t } = useLanguage();
  const { data, builderOpen, playing, checkoutFor } = useStory();
  const [section, setSection] = useState("top");
  const [pokes, setPokes] = useState(0);
  const [chatty, setChatty] = useState(false);
  const name = data.childName.trim();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSection(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    const watch = () =>
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
      });
    watch();
    // The library section appears only once a story exists.
    const late = setInterval(watch, 2000);
    return () => {
      clearInterval(late);
      obs.disconnect();
    };
  }, []);

  // A new section: she says her line for that section (large screens only).
  useEffect(() => {
    setPokes(0);
    setChatty(window.matchMedia("(min-width: 1024px)").matches);
  }, [section]);

  // The bubble steps aside after a moment so it never sits on the content.
  useEffect(() => {
    if (!chatty) return;
    const id = setTimeout(() => setChatty(false), 4200);
    return () => clearTimeout(id);
  }, [chatty, pokes, section]);

  if (builderOpen || playing || checkoutFor) return null;

  const line = pokes
    ? t(`guide.poke${((pokes - 1) % 4) + 1}`, { name: name || t("common.yourChildLower") })
    : section === "top" && name
      ? t("guide.top.named", { name })
      : t(`guide.${section}`);

  return (
    <div className="pointer-events-none fixed bottom-20 end-3 z-40 flex items-end gap-2 sm:bottom-4 sm:end-auto sm:start-4 sm:flex-row-reverse">
      <AnimatePresence mode="wait">
        <motion.div
          key={line}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`pointer-events-auto mb-8 max-w-[13rem] ${chatty ? "block" : "hidden"}`}
        >
          <Speech tail="end" className="text-sm sm:hidden">
            {line}
          </Speech>
          <Speech tail="start" className="hidden text-sm sm:block">
            {line}
          </Speech>
        </motion.div>
      </AnimatePresence>
      <motion.div
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 16, delay: 1.2 }}
        className="pointer-events-auto w-16 sm:w-20"
      >
        <Buddy
          id="lumi"
          mood={moods[section] ?? "idle"}
          label={t("buddy.lumi.name")}
          onPoke={() => {
            setPokes((p) => p + 1);
            setChatty(true);
          }}
        />
      </motion.div>
    </div>
  );
}
