import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUp } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import { Button, Logo } from "./ui";
import { scrollToSection } from "./Navbar";
import Buddy, { type BuddyId } from "../characters/Buddy";

const parade: BuddyId[] = ["bolt", "pinso", "trixie", "lumi", "champi", "plouf", "kiki"];
const links = ["how", "crew", "adventures", "pricing", "privacy", "faq"];

export default function Footer() {
  const { t } = useLanguage();
  const { data, openBuilder } = useStory();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const name = data.childName.trim();

  return (
    <footer className="bg-ink">
      {/* Final call to action grows into place as it scrolls in */}
      <div ref={ref} className="bg-cream px-5 pb-24 pt-8">
        <motion.div
          style={{ scale }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border-2 border-ink bg-coral px-6 py-16 text-center shadow-pop-lg sm:py-20"
        >
          <div className="dots pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            <div className="flex items-end justify-center gap-1 sm:gap-3">
              {parade.map((id, i) => (
                <motion.div
                  key={id}
                  className={i === 0 || i === parade.length - 1 ? "hidden w-14 sm:block sm:w-16" : "w-12 sm:w-16"}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                >
                  <Buddy id={id} mood="happy" watch={false} />
                </motion.div>
              ))}
            </div>
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg font-semibold text-ink/80">{t("cta.sub")}</p>
            <Button variant="sun" size="lg" className="mt-8" onClick={openBuilder}>
              <span className="max-w-[16rem] truncate">
                {name ? t("hero.cta.named", { name }) : t("cta.button")}
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 rtl:rotate-180" />
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12 text-white">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Logo light />
            <p className="mt-3 max-w-sm text-white/65">{t("footer.tagline")}</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((id) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="font-display font-medium text-white/80 transition-colors hover:text-sun"
              >
                {t(`nav.${id}`)}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/55 sm:flex-row sm:items-center">
          <p>
            <span dir="ltr">© 2026 LittleHero.</span> {t("footer.made")}
          </p>
          <button
            onClick={() => scrollToSection("top")}
            className="inline-flex items-center gap-1.5 font-semibold text-white/80 hover:text-sun"
          >
            {t("footer.top")} <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
