import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { useStory } from "../../state/StoryContext";
import { traits } from "../../data";
import StoryCover from "../StoryCover";
import { Button, Logo, Tilt } from "../ui";
import { cn } from "../../utils/cn";
import { Generating, StepHero, StepLook, StepPowers, StepWorld } from "./steps";

const STEPS = [
  { id: "hero", emoji: "👋" },
  { id: "look", emoji: "🎨" },
  { id: "powers", emoji: "⚡" },
  { id: "world", emoji: "🗺️" },
] as const;

export default function StoryBuilder() {
  const { t, isRTL, lang } = useLanguage();
  const { data, builderOpen, closeBuilder, step, setStep, generating, createStory } = useStory();
  const [direction, setDirection] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = STEPS[step].id;
  const isLast = step === STEPS.length - 1;

  // Lock the page behind the studio and let Escape close it.
  useEffect(() => {
    if (!builderOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !generating && closeBuilder();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [builderOpen, closeBuilder, generating]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step, generating]);

  const hint = (() => {
    if (current === "hero") {
      if (data.childName.trim().length < 2) return "b.hint.name";
      if (!data.gender) return "b.hint.gender";
    }
    if (current === "world" && !data.themeId) return "b.hint.theme";
    return null;
  })();

  const go = (to: number) => {
    setDirection(to > step ? 1 : -1);
    setStep(to);
  };

  const showSide = !generating && current !== "look";
  const slide = (isRTL ? -1 : 1) * direction * 48;

  return (
    <AnimatePresence>
      {builderOpen && (
        <motion.div
          key="studio"
          role="dialog"
          aria-modal="true"
          aria-label={t("b.title")}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="dots fixed inset-0 z-[100] flex flex-col bg-cream"
        >
          <header className="shrink-0 border-b-2 border-ink bg-paper">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
              <Logo />
              <span className="hidden font-display font-semibold text-ink/60 sm:block">{t("b.title")}</span>
              <button
                onClick={closeBuilder}
                disabled={generating}
                className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-cream px-3 py-1.5 font-display text-sm font-semibold transition-colors hover:bg-sun disabled:opacity-30"
              >
                <X className="h-4 w-4" />
                {t("common.close")}
              </button>
            </div>

            {!generating && (
              <div className="mx-auto max-w-xl px-4 pb-4">
                <ol className="relative flex items-center justify-between">
                  <div className="absolute inset-x-5 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink/10">
                    <motion.div
                      className="h-full rounded-full bg-mint"
                      animate={{ scaleX: step / (STEPS.length - 1) }}
                      style={{ originX: isRTL ? 1 : 0 }}
                      transition={{ type: "spring", stiffness: 160, damping: 22 }}
                    />
                  </div>
                  {STEPS.map((s, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                      <li key={s.id} className="relative">
                        <button
                          onClick={() => done && go(i)}
                          disabled={!done}
                          aria-label={t(`b.s.${s.id}`)}
                          aria-current={active ? "step" : undefined}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink text-lg transition-colors",
                            done ? "bg-mint" : active ? "bg-sun" : "bg-paper"
                          )}
                        >
                          {done ? (
                            <Check className="h-5 w-5" strokeWidth={3} />
                          ) : (
                            <motion.span
                              animate={active ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : { scale: 1 }}
                              transition={{ duration: 0.6 }}
                              className={active ? "" : "opacity-40 grayscale"}
                            >
                              {s.emoji}
                            </motion.span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-2 text-center text-sm font-bold text-ink/60">
                  {t("b.step", { n: step + 1, total: STEPS.length })} ·{" "}
                  <span className="text-ink">{t(`b.s.${current}`)}</span>
                </p>
              </div>
            )}
          </header>

          <div ref={scrollRef} className="relative flex-1 overflow-y-auto overflow-x-hidden">
            <div className={cn("mx-auto grid max-w-6xl gap-10 px-4 py-8", showSide && "lg:grid-cols-[minmax(0,1fr)_18rem]")}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={generating ? "generating" : current}
                  initial={{ opacity: 0, x: slide }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -slide }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="min-w-0"
                >
                  {generating ? (
                    <Generating />
                  ) : (
                    <>
                      {current === "hero" && <StepHero />}
                      {current === "look" && <StepLook />}
                      {current === "powers" && <StepPowers />}
                      {current === "world" && <StepWorld />}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {showSide && (
                <aside className="hidden lg:block">
                  <div className="sticky top-2">
                    <p className="mb-3 text-center font-display font-semibold">
                      <span className="me-1.5 inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-coral" />
                      {t("b.live")}
                    </p>
                    <Tilt max={10} className="mx-auto w-56">
                      <StoryCover name={data.childName} themeId={data.themeId} avatar={data.avatar} />
                    </Tilt>
                    <div className="mt-6 flex min-h-8 flex-wrap justify-center gap-1.5">
                      <AnimatePresence>
                        {data.traits.map((id) => {
                          const tr = traits.find((x) => x.id === id)!;
                          return (
                            <motion.span
                              key={id}
                              layout
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 text-sm font-bold"
                            >
                              {tr.emoji} {t(`trait.${id}`)}
                            </motion.span>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </div>

          {!generating && (
            <footer className="shrink-0 border-t-2 border-ink bg-paper">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
                <Button variant="paper" size="sm" onClick={() => go(step - 1)} disabled={step === 0} className="py-3">
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                  <span className="hidden sm:inline">{t("common.back")}</span>
                </Button>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={hint ?? "ok"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="min-w-0 flex-1 text-center text-xs font-bold text-ink/60 sm:text-sm"
                  >
                    {hint ? t(hint) : ""}
                  </motion.p>
                </AnimatePresence>

                {isLast ? (
                  <Button variant="coral" onClick={() => createStory(lang)} disabled={!!hint}>
                    ✨ {t("b.create")}
                  </Button>
                ) : (
                  <Button variant="ink" onClick={() => go(step + 1)} disabled={!!hint}>
                    {t("common.continue")}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                )}
              </div>
            </footer>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
