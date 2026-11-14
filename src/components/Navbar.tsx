import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLanguage, type Language } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import { Button, Logo } from "./ui";
import { cn } from "../utils/cn";

const links = ["how", "crew", "adventures", "pricing", "faq"];

export function scrollToSection(id: string) {
  if (id === "top") window.scrollTo({ top: 0, behavior: "smooth" });
  else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function LangToggle() {
  const { lang, setLang, t } = useLanguage();
  const options: { id: Language; label: string }[] = [
    { id: "fr", label: "FR" },
    { id: "ar", label: "عربي" },
  ];
  return (
    <div
      role="group"
      aria-label={t("nav.lang")}
      dir="ltr"
      className="flex rounded-full border-2 border-ink bg-cream p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => setLang(o.id)}
          aria-pressed={lang === o.id}
          className="relative h-8 min-w-9 rounded-full px-2.5 font-display text-sm font-semibold"
        >
          {lang === o.id && (
            <motion.span
              layoutId="lang-pill"
              className="absolute inset-0 rounded-full bg-ink"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className={cn("relative", lang === o.id ? "text-white" : "text-ink")}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { t, isRTL } = useLanguage();
  const { openBuilder } = useStory();
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-1.5 bg-coral"
        style={{ scaleX: progress, originX: isRTL ? 1 : 0 }}
      />
      <motion.header
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
        className="fixed inset-x-3 top-4 z-50 mx-auto max-w-6xl"
      >
        <div className="flex items-center justify-between gap-2 rounded-full border-2 border-ink bg-paper/95 py-2 ps-4 pe-2 shadow-pop backdrop-blur">
          <button onClick={() => go("top")} aria-label="LittleHero">
            <Logo />
          </button>

          <nav className="hidden items-center lg:flex">
            {links.map((id) => (
              <button
                key={id}
                onClick={() => go(id)}
                className="relative rounded-full px-3.5 py-2 font-display text-[15px] font-medium text-ink"
              >
                {active === id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-sun"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{t(`nav.${id}`)}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LangToggle />
            <Button size="sm" variant="coral" onClick={openBuilder} className="hidden sm:inline-flex">
              ✨ {t("nav.cta")}
            </Button>
            <button
              onClick={() => setOpen(!open)}
              aria-label={t("nav.menu")}
              aria-expanded={open}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-cream lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-3xl border-2 border-ink bg-paper p-3 shadow-pop lg:hidden"
            >
              {links.map((id, i) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: isRTL ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => go(id)}
                  className="block w-full rounded-2xl px-4 py-3 text-start font-display text-lg font-medium hover:bg-sun/40"
                >
                  {t(`nav.${id}`)}
                </motion.button>
              ))}
              <Button
                variant="coral"
                className="mt-2 w-full"
                onClick={() => {
                  setOpen(false);
                  openBuilder();
                }}
              >
                ✨ {t("nav.cta")}
              </Button>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
