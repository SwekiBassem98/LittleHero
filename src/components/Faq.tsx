import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import Buddy from "../characters/Buddy";

const faqIds = [1, 6, 2, 3, 4, 5];
import { Reveal, SectionHead } from "./ui";
import { cn } from "../utils/cn";

export default function Faq() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(3);

  return (
    <section id="faq" className="relative scroll-mt-24 overflow-hidden bg-sky/25 px-5 py-24 sm:py-32">
      <div className="absolute -end-6 top-16 hidden w-32 -rotate-12 lg:block">
        <Buddy id="plouf" mood="think" flip />
      </div>
      <SectionHead kicker={`🤔 ${t("faq.kicker")}`} color="bg-sky" title={t("faq.title")} />
      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        {faqIds.map((id, i) => {
          const isOpen = open === id;
          return (
            <Reveal key={id} delay={i * 0.05} y={20}>
              <div
                className={cn(
                  "overflow-hidden rounded-3xl border-2 border-ink transition-all",
                  isOpen ? "bg-paper shadow-pop" : "bg-paper/80 shadow-pop-sm"
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start sm:px-6"
                >
                  <span className="font-display text-lg font-semibold">{t(`faq.${id}.q`)}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 135 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink",
                      isOpen ? "bg-coral" : "bg-sun"
                    )}
                  >
                    <Plus className="h-5 w-5" strokeWidth={3} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-ink/75 sm:px-6">{t(`faq.${id}.a`)}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
