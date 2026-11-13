import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Lock, Play, Trash2 } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import StoryCover from "./StoryCover";
import { SectionHead } from "./ui";

/** Stories already created on this device. Hidden until there is at least one. */
export default function Library() {
  const { t } = useLanguage();
  const { library, play, removeStory, isUnlocked, printStory } = useStory();
  const [confirming, setConfirming] = useState<string | null>(null);

  if (!library.length) return null;

  return (
    <section id="library" className="scroll-mt-24 px-5 py-24 sm:py-28">
      <SectionHead kicker={`📚 ${t("lib.kicker")}`} color="bg-sky" title={t("lib.title")} sub={t("lib.sub")} />

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence>
          {library.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, rotate: -8 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              dir={item.lang === "ar" ? "rtl" : "ltr"}
            >
              <motion.button
                onClick={() => play(item)}
                whileHover={{ y: -6, rotate: -1.5 }}
                whileTap={{ scale: 0.96 }}
                className="group relative block w-full text-start"
                aria-label={`${t("lib.read")} — ${item.story.title}`}
              >
                <StoryCover name={item.hero.name} themeId={item.themeId} avatar={item.hero.avatar} title={item.story.title} className="!shadow-pop" />
                <span className="absolute start-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-sun opacity-0 shadow-pop-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Play className="h-4 w-4 fill-ink" />
                </span>
                <span
                  className={`absolute end-3 top-3 flex items-center gap-1 rounded-full border-2 border-ink px-2 py-0.5 text-xs font-bold text-ink ${isUnlocked(item.id) ? "bg-mint" : "bg-paper"}`}
                >
                  {isUnlocked(item.id) ? "✓" : <Lock className="h-3 w-3" />}
                  {t(isUnlocked(item.id) ? "lib.full" : "lib.preview")}
                </span>
              </motion.button>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-ink/55" dir="ltr">
                  {new Date(item.createdAt).toLocaleDateString(item.lang === "ar" ? "ar" : "fr-FR", { day: "numeric", month: "short" })}
                </span>
                {isUnlocked(item.id) && (
                  <button
                    onClick={() => printStory(item)}
                    aria-label={`${t("pdf.download")} — ${item.story.title}`}
                    className="ms-auto flex h-8 items-center gap-1 rounded-full border-2 border-ink bg-sun px-2.5 text-xs font-bold"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>
                )}
                {confirming === item.id ? (
                  <button
                    onClick={() => {
                      removeStory(item.id);
                      setConfirming(null);
                    }}
                    onBlur={() => setConfirming(null)}
                    autoFocus
                    className="rounded-full border-2 border-ink bg-coral px-3 py-1 text-xs font-bold"
                  >
                    {t("lib.confirm")}
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirming(item.id)}
                    aria-label={`${t("lib.delete")} — ${item.story.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink/20 text-ink/60 transition-colors hover:border-ink hover:bg-coral hover:text-ink"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="mt-8 text-center text-sm font-bold text-ink/55">🔒 {t("lib.device")}</p>
    </section>
  );
}
