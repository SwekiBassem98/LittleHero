import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Dices } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import { themes } from "../data";
import Buddy, { type BuddyId } from "../characters/Buddy";
import { randomAvatar } from "../characters/KidAvatar";
import StoryCover from "./StoryCover";
import { Button, Squiggle, Tilt } from "./ui";
import { scrollToSection } from "./Navbar";

const floaters: { id: BuddyId; className: string; speed: number; flip?: boolean }[] = [
  { id: "bolt", className: "-top-[9%] -start-[14%] w-[30%]", speed: -150 },
  { id: "plouf", className: "top-[34%] -end-[20%] w-[30%]", speed: -260, flip: true },
  { id: "kiki", className: "-bottom-[7%] -start-[18%] w-[30%]", speed: -110 },
];

function Floater({ id, className, speed, flip, index }: (typeof floaters)[number] & { index: number }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, speed]);
  return (
    <motion.div
      style={{ y }}
      initial={{ scale: 0, rotate: -40 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 13, delay: 0.6 + index * 0.12 }}
      className={`absolute z-20 ${className}`}
    >
      <Buddy id={id} flip={flip} />
    </motion.div>
  );
}

export default function Hero() {
  const { t } = useLanguage();
  const { data, update, openBuilder } = useStory();
  const [cycle, setCycle] = useState(0);
  const name = data.childName.trim();

  // Until the parent picks a world, the cover tours all of them.
  useEffect(() => {
    if (data.themeId) return;
    const id = setInterval(() => setCycle((c) => (c + 1) % themes.length), 3200);
    return () => clearInterval(id);
  }, [data.themeId]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    openBuilder();
  };

  const who = name || t("common.yourChild");

  return (
    <section id="top" className="dots relative overflow-hidden pb-20 pt-32 sm:pt-40">
      <div className="pointer-events-none absolute -top-32 -start-32 h-96 w-96 rounded-full bg-sun/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -end-24 h-[28rem] w-[28rem] rounded-full bg-bubble/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-mint px-4 py-1.5 font-display text-sm font-semibold shadow-pop-sm"
          >
            <span className="animate-wiggle">🪄</span>
            {t("hero.badge")}
          </motion.span>

          <h1 className="mt-6 font-display text-[2.7rem] font-bold leading-[1.05] sm:text-6xl lg:text-[4.2rem]">
            <span className="block min-h-[1.1em] overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={name ? "name" : "default"}
                  className="inline-block text-grape"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {who}
                </motion.span>
              </AnimatePresence>
            </span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("hero.l2.pre")}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">{t("hero.l2.mark")}</span>
                <Squiggle className="absolute -bottom-2 start-0 h-3 w-full text-coral" />
              </span>
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("hero.l3")}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 max-w-xl text-lg text-ink/75 sm:text-xl"
          >
            {t("hero.sub")}
          </motion.p>

          {/* Live name input: typing here personalises the whole page */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, type: "spring", stiffness: 160, damping: 18 }}
            className="mt-8 max-w-xl rounded-[2rem] border-2 border-ink bg-paper p-4 shadow-pop sm:p-5"
          >
            <label htmlFor="hero-name" className="block font-display text-lg font-semibold">
              {t("hero.name.label")}
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="hero-name"
                type="text"
                value={data.childName}
                maxLength={20}
                autoComplete="off"
                onChange={(e) => update("childName", e.target.value)}
                placeholder={t("hero.name.placeholder")}
                className="min-w-0 flex-1 rounded-full border-2 border-ink bg-cream px-5 py-3 font-display text-lg font-semibold outline-none transition-colors placeholder:font-normal placeholder:text-ink/40 focus:bg-sun/30"
              />
              <Button type="submit" variant="coral" className="shrink-0">
                <span className="max-w-[14rem] truncate">{name ? t("hero.cta.named", { name }) : t("hero.cta")}</span>
                <ArrowRight className="h-5 w-5 shrink-0 rtl:rotate-180" />
              </Button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-ink/60">
              <span>👆</span> {t("hero.try")}
            </p>
          </motion.form>

          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.8 } } }}
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-ink/80"
          >
            {["⚡", "🙈", "🔊"].map((icon, i) => (
              <motion.li key={icon} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="flex items-center gap-1.5">
                <span>{icon}</span>
                {t(`hero.perk${i + 1}`)}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Live cover with the crew around it */}
        <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-[21rem]">
          {floaters.map((f, i) => (
            <Floater key={f.id} {...f} index={i} />
          ))}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: -9 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 120, damping: 14 }}
            className="absolute inset-0 -translate-x-5 translate-y-3 rounded-[7%/5.5%] border-2 border-ink bg-sun"
          />
          <motion.div
            initial={{ opacity: 0, y: 60, rotate: 10 }}
            animate={{ opacity: 1, y: 0, rotate: 3 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 120, damping: 14 }}
          >
            <Tilt>
              <StoryCover name={data.childName} themeId={data.themeId || themes[cycle].id} avatar={data.avatar} />
            </Tilt>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="relative z-30 -mt-4 flex justify-center"
          >
            <Button variant="sun" size="sm" onClick={() => update("avatar", randomAvatar())}>
              <Dices className="h-4 w-4" /> {t("hero.shuffle")}
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.button
        onClick={() => scrollToSection("how")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative mx-auto mt-14 flex flex-col items-center gap-1 font-display text-sm font-semibold text-ink/60"
      >
        {t("hero.scroll")}
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </motion.button>
    </section>
  );
}
