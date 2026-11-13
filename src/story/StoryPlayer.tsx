import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Download, Lock, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import StoryCover from "../components/StoryCover";
import Buddy from "../characters/Buddy";
import { Button, Confetti } from "../components/ui";
import { themeById } from "../data";
import { cn } from "../utils/cn";
import Scene from "./Scene";
import { pageText } from "../shop/PrintBook";
import { FREE_PAGES, money, offers } from "../shop/pricing";

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

function speak(text: string, lang: string) {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "ar" ? "ar-SA" : "fr-FR";
  u.rate = 0.88;
  u.pitch = 1.1;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

/** Full-screen reader: cover → animated pages → the end. */
export default function StoryPlayer() {
  const { t } = useLanguage();
  const { playing, stopPlaying, openBuilder, reset, isUnlocked, credits, unlockWithCredit, openCheckout, checkoutFor, printStory, setPick } =
    useStory();
  // -1 = cover, 0..n-1 = pages, n = the end
  const [index, setIndex] = useState(-1);
  const [narrate, setNarrate] = useState(false);

  const story = playing?.story;
  const count = story?.pages.length ?? 0;
  const rtl = playing?.lang === "ar";
  const unlocked = playing ? isUnlocked(playing.id) : false;
  const inStory = !!story && index >= 0 && index < count;
  const locked = inStory && !unlocked && index >= FREE_PAGES;
  const page = inStory && !locked ? story.pages[index] : null;
  // The child decides how the hero solves the problem before the page is told.
  const choosing = !!page && page.beat === "idea" && !!story?.choice && playing?.pick === undefined;
  const text = page && playing && !choosing ? pageText(playing, index) : "";

  useEffect(() => {
    setIndex(-1);
  }, [playing?.id]);

  const close = useCallback(() => {
    if (canSpeak) window.speechSynthesis.cancel();
    stopPlaying();
  }, [stopPlaying]);

  const go = useCallback(
    (to: number) => setIndex(Math.max(-1, Math.min(count, to))),
    [count]
  );

  useEffect(() => {
    if (!playing) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (checkoutFor) return;
      if (e.key === "Escape") close();
      const forward = rtl ? "ArrowLeft" : "ArrowRight";
      const back = rtl ? "ArrowRight" : "ArrowLeft";
      if (e.key === forward || e.key === " ") setIndex((i) => Math.min(count, i + 1));
      if (e.key === back) setIndex((i) => Math.max(-1, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [playing, close, count, rtl, checkoutFor]);

  // Read the page aloud when narration is on.
  useEffect(() => {
    if (!playing || !narrate) return;
    if (choosing && story?.choice) speak(story.choice.question, playing.lang);
    else if (text) speak(text, playing.lang);
    else if (index === -1 && story) speak(story.title, playing.lang);
    else if (index === count && story) speak(story.moral, playing.lang);
    return () => {
      if (canSpeak) window.speechSynthesis.cancel();
    };
  }, [playing, narrate, text, choosing, index, count, story]);

  const words = useMemo(() => (text ? text.split(/\s+/) : []), [text]);

  if (!playing || !story) return null;
  const theme = themeById(playing.themeId) ?? themeById("space")!;
  const textSize = playing.hero.age <= 3 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";

  return (
    <AnimatePresence>
      <motion.div
        key={playing.id}
        role="dialog"
        aria-modal="true"
        aria-label={story.title}
        dir={rtl ? "rtl" : "ltr"}
        lang={playing.lang}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex flex-col bg-ink text-white"
      >
        {/* top bar */}
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={close}
            className="flex items-center gap-1.5 rounded-full border-2 border-white/30 px-3 py-1.5 font-display text-sm font-semibold transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4" />
            {t("common.close")}
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center font-display text-lg font-semibold">{story.title}</h1>
          {unlocked && (
            <button
              onClick={() => printStory(playing)}
              aria-label={t("pdf.download")}
              className="flex items-center gap-1.5 rounded-full border-2 border-white/30 px-3 py-1.5 font-display text-sm font-semibold transition-colors hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          )}
          {canSpeak ? (
            <button
              onClick={() => setNarrate((n) => !n)}
              aria-pressed={narrate}
              className={cn(
                "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-display text-sm font-semibold transition-colors",
                narrate ? "border-sun bg-sun text-ink" : "border-white/30 hover:bg-white/10"
              )}
            >
              {narrate ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden sm:inline">{t(narrate ? "player.narrate.on" : "player.narrate.off")}</span>
            </button>
          ) : (
            <span className="w-16" />
          )}
        </header>

        {/* progress */}
        <div className="mx-auto flex w-full max-w-3xl shrink-0 gap-1.5 px-4" dir={rtl ? "rtl" : "ltr"}>
          {[...Array(count + 2)].map((_, i) => (
            <button
              key={i}
              onClick={() => go(i - 1)}
              aria-label={`${i + 1}/${count + 2}`}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                i - 1 <= index ? "bg-sun" : !unlocked && i - 1 >= FREE_PAGES && i - 1 < count ? "bg-coral/50" : "bg-white/20"
              )}
            />
          ))}
        </div>

        {/* stage */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-4">
          <AnimatePresence mode="wait">
            {index === -1 && (
              <motion.div
                key="cover"
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: rtl ? 80 : -80 }}
                transition={{ type: "spring", stiffness: 140, damping: 16 }}
                className="flex flex-col items-center text-center"
              >
                <StoryCover
                  name={playing.hero.name}
                  themeId={playing.themeId}
                  avatar={playing.hero.avatar}
                  title={story.title}
                  className="w-60 sm:w-72"
                />
                {playing.dedication && (
                  <p className="mt-6 max-w-md font-display text-lg text-white/85">
                    “{playing.dedication}”
                    {playing.dedicationFrom && <span className="mt-1 block text-base text-white/60">— {playing.dedicationFrom}</span>}
                  </p>
                )}
                <Button variant="sun" size="lg" className="mt-6" onClick={() => go(0)}>
                  {t("player.start")}
                  <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                </Button>
              </motion.div>
            )}

            {page && (
              // One scene stays on stage for the whole story, so the camera, the
              // light and the characters move from page to page instead of cutting.
              <motion.div
                key="pages"
                initial={{ opacity: 0, x: rtl ? -60 : 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: rtl ? 60 : -60 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-3xl"
              >
                <Scene themeId={playing.themeId} beat={page.beat} direction={page.scene} avatar={playing.hero.avatar} className="shadow-[0_0_0_4px_rgba(255,255,255,0.08)]" />
                {choosing && story.choice ? (
                  <div className="mt-5 rounded-3xl bg-paper px-5 py-5 text-center text-ink sm:px-8">
                    <p className="font-display text-xl font-semibold sm:text-2xl">🤔 {story.choice.question}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {story.choice.options.map((o, i) => (
                        <Button key={i} variant={i ? "mint" : "sun"} size="lg" onClick={() => setPick(playing.id, i)}>
                          {o.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={cn("mt-5 rounded-3xl bg-paper px-5 py-4 text-center font-display font-medium leading-relaxed text-ink sm:px-8 sm:py-5", textSize)}>
                    {words.map((w, i) => (
                      <motion.span
                        key={`${index}-${playing.pick}-${i}`}
                        className="inline-block"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.045, duration: 0.25 }}
                      >
                        {w}
                        {"\u00A0"}
                      </motion.span>
                    ))}
                  </p>
                )}
              </motion.div>
            )}

            {locked && (
              <motion.div
                key="paywall"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex w-full max-w-lg flex-col items-center text-center"
              >
                <div className="relative w-36">
                  <Buddy id={theme.buddy} mood="wow" />
                  <span className="absolute -end-2 top-0 flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-sun text-ink">
                    <Lock className="h-5 w-5" />
                  </span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t("pay.title", { name: playing.hero.name })}</h2>
                <p className="mt-3 text-lg text-white/75">{t("pay.sub", { n: FREE_PAGES, total: count })}</p>
                <div className="mt-7 flex flex-col items-center gap-3">
                  {credits > 0 && (
                    <Button variant="mint" size="lg" onClick={() => unlockWithCredit(playing.id)}>
                      🎟️ {t("pay.credit", { n: credits })}
                    </Button>
                  )}
                  <Button variant="sun" size="lg" onClick={() => openCheckout(playing)}>
                    {t("pay.cta")} · <span dir="ltr">{money(offers[0].price)}</span>
                    <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                  </Button>
                  <button onClick={() => go(FREE_PAGES - 1)} className="font-display text-sm font-semibold text-white/60 underline underline-offset-4 hover:text-white">
                    {t("pay.back")}
                  </button>
                </div>
                <p className="mt-6 text-sm text-white/50">{t("pay.note")}</p>
              </motion.div>
            )}

            {index === count && (
              <motion.div
                key="end"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative flex w-full max-w-lg flex-col items-center text-center"
              >
                <Confetti count={40} />
                <div className="w-32">
                  <Buddy id={theme.buddy} mood="happy" />
                </div>
                <h2 className="mt-3 font-display text-5xl font-bold text-sun">{t("player.end")}</h2>
                <p className="mt-4 rounded-3xl bg-white/10 px-5 py-4 font-display text-xl leading-snug">💛 {story.moral}</p>
                {playing.dedication && (
                  <p className="mt-4 text-white/75">
                    “{playing.dedication}”{playing.dedicationFrom && ` — ${playing.dedicationFrom}`}
                  </p>
                )}
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Button variant="sun" onClick={() => printStory(playing)}>
                    <Download className="h-4 w-4" /> {t("pdf.download")}
                  </Button>
                  <Button variant="paper" onClick={() => go(-1)}>
                    <RotateCcw className="h-4 w-4" /> {t("player.again")}
                  </Button>
                  <Button
                    variant="coral"
                    onClick={() => {
                      close();
                      reset();
                      openBuilder();
                    }}
                  >
                    ✨ {t("player.new")}
                  </Button>
                </div>
                <p className="mt-6 text-sm text-white/50">
                  {t(story.source === "ai" ? "player.source.ai" : "player.source.offline")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* page turns */}
        {page && (
          <footer className="flex shrink-0 items-center justify-between gap-3 px-4 pb-4">
            <Button variant="paper" onClick={() => go(index - 1)} aria-label={t("player.prev")}>
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            </Button>
            <span className="font-display text-sm font-semibold text-white/60" dir="ltr">
              {index + 1} / {count}
            </span>
            <Button variant="sun" onClick={() => go(index + 1)} disabled={choosing}>
              {t(index === count - 1 ? "player.finish" : "player.next")}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </Button>
          </footer>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
