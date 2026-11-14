import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Dices } from "lucide-react";
import { ageLabel, useLanguage } from "../../i18n/LanguageContext";
import { MAX_TRAITS, useStory } from "../../state/StoryContext";
import { themeById, themes, traits, values } from "../../data";
import Buddy, { BUDDY_IDS, Speech, type BuddyId, type Mood } from "../../characters/Buddy";
import PhotoMagic from "./PhotoMagic";
import KidAvatar, {
  EXTRA_CHOICES,
  EYES,
  HAIRS,
  HAIR_COLORS,
  OUTFITS,
  SKINS,
  randomAvatar,
  type AvatarConfig,
} from "../../characters/KidAvatar";
import { Button } from "../ui";
import { cn } from "../../utils/cn";
import type { Gender } from "../../story/types";

/* ---------- the guide: a character asks the question of each step ---------- */
function Guide({ buddy = "lumi", mood = "idle", title, sub }: { buddy?: BuddyId; mood?: Mood; title: string; sub: string }) {
  return (
    <div className="mx-auto mb-8 flex max-w-xl items-start gap-3 sm:gap-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={buddy}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 15 }}
          className="w-20 shrink-0 sm:w-28"
        >
          <Buddy id={buddy} mood={mood} />
        </motion.div>
      </AnimatePresence>
      <Speech className="mt-2 flex-1 px-5 py-4">
        <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
        <p className="mt-1 font-sans text-base font-semibold text-ink/65">{sub}</p>
      </Speech>
    </div>
  );
}

function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-2.5 font-display text-lg font-semibold">
      {children}
      {hint && <span className="ms-2 text-sm font-medium text-ink/50">({hint})</span>}
    </div>
  );
}

function useName() {
  const { data } = useStory();
  const { t } = useLanguage();
  return data.childName.trim() || t("common.yourChildLower");
}

/* ---------- 1. Who is the hero? ---------- */
const genders: { id: Gender; emoji: string }[] = [
  { id: "girl", emoji: "👧" },
  { id: "boy", emoji: "👦" },
  { id: "neutral", emoji: "🌟" },
];

export function StepHero() {
  const { t } = useLanguage();
  const { data, update } = useStory();
  const ready = data.childName.trim().length > 1 && !!data.gender;

  return (
    <div className="mx-auto max-w-xl">
      <Guide
        mood={ready ? "happy" : "idle"}
        title={data.childName.trim().length > 1 ? t("b.hero.title.named", { name: data.childName.trim() }) : t("b.hero.title")}
        sub={t("b.hero.sub")}
      />

      <div className="space-y-8">
        <div>
          <FieldLabel>{t("b.hero.name")}</FieldLabel>
          <input
            type="text"
            value={data.childName}
            maxLength={20}
            autoComplete="off"
            onChange={(e) => update("childName", e.target.value)}
            placeholder={t("b.hero.name.ph")}
            className="w-full rounded-full border-2 border-ink bg-paper px-6 py-4 font-display text-xl font-semibold shadow-pop-sm outline-none transition-colors placeholder:font-normal placeholder:text-ink/40 focus:bg-sun/25"
          />
        </div>

        <div>
          <FieldLabel>
            {t("b.hero.age")}
            <AnimatePresence mode="wait">
              <motion.span
                key={data.age}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="ms-3 inline-block rounded-full border-2 border-ink bg-sun px-3 py-0.5 text-sm"
              >
                {ageLabel(t, data.age)}
              </motion.span>
            </AnimatePresence>
          </FieldLabel>
          <div className="flex flex-wrap gap-2" dir="ltr">
            {[...Array(11)].map((_, age) => {
              const active = data.age === age;
              return (
                <motion.button
                  key={age}
                  onClick={() => update("age", age)}
                  aria-pressed={active}
                  aria-label={ageLabel(t, age)}
                  whileTap={{ scale: 0.85 }}
                  animate={{ scale: active ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className={cn(
                    "h-11 w-11 rounded-full border-2 border-ink font-display text-lg font-semibold",
                    active ? "bg-coral shadow-pop-sm" : "bg-paper hover:bg-sun/40"
                  )}
                >
                  {age === 0 ? "👶" : age}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <FieldLabel>{t("b.hero.gender")}</FieldLabel>
          <div className="grid grid-cols-3 gap-3">
            {genders.map((g) => {
              const active = data.gender === g.id;
              return (
                <motion.button
                  key={g.id}
                  onClick={() => update("gender", g.id)}
                  aria-pressed={active}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-3xl border-2 border-ink px-2 py-4 font-display font-semibold",
                    active ? "bg-mint shadow-pop" : "bg-paper shadow-pop-sm"
                  )}
                >
                  <motion.span
                    className="text-3xl"
                    animate={active ? { rotate: [0, -14, 14, 0], scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {g.emoji}
                  </motion.span>
                  <span className="text-sm sm:text-base">{t(`gender.${g.id}`)}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. Draw the hero ---------- */
function Swatches({ colors, value, onPick, label }: { colors: string[]; value: number; onPick: (i: number) => void; label: string }) {
  return (
    <div className="flex flex-wrap gap-2.5" role="group" aria-label={label}>
      {colors.map((c, i) => (
        <motion.button
          key={c}
          onClick={() => onPick(i)}
          aria-pressed={value === i}
          aria-label={`${label} ${i + 1}`}
          whileTap={{ scale: 0.8 }}
          animate={{ scale: value === i ? 1.18 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 14 }}
          className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink", value === i && "shadow-pop-sm")}
          style={{ background: c }}
        >
          {value === i && <Check className="h-5 w-5 text-white mix-blend-difference" strokeWidth={3.5} />}
        </motion.button>
      ))}
    </div>
  );
}

export function StepLook() {
  const { t } = useLanguage();
  const { data, update } = useStory();
  const name = useName();
  const avatar = data.avatar;
  const [spin, setSpin] = useState(0);
  const set = (patch: Partial<AvatarConfig>) => update("avatar", { ...avatar, ...patch });

  return (
    <div>
      <Guide mood="happy" title={t("b.look.title", { name })} sub={t("b.look.sub")} />
      <PhotoMagic />

      <div className="mx-auto grid max-w-4xl items-start gap-8 md:grid-cols-[18rem_minmax(0,1fr)]">
        {/* live preview */}
        <div className="mx-auto w-full max-w-[18rem] md:sticky md:top-2">
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-ink bg-sky/50 px-6 pt-6 shadow-pop">
            <div className="absolute inset-x-0 bottom-0 h-1/3 rounded-t-[100%] bg-mint" />
            <motion.div key={spin} initial={{ rotateY: spin ? 180 : 0, scale: 0.8 }} animate={{ rotateY: 0, scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14 }} className="relative mx-auto w-44">
              <KidAvatar config={avatar} pose="wave" mood="happy" />
            </motion.div>
          </div>
          <Button
            variant="sun"
            className="mt-4 w-full"
            onClick={() => {
              update("avatar", randomAvatar());
              setSpin((s) => s + 1);
            }}
          >
            <Dices className="h-5 w-5" /> {t("b.look.random")}
          </Button>
        </div>

        {/* choices */}
        <div className="space-y-6">
          <div>
            <FieldLabel>{t("b.look.skin")}</FieldLabel>
            <Swatches colors={SKINS} value={avatar.skin} onPick={(i) => set({ skin: i })} label={t("b.look.skin")} />
          </div>

          <div>
            <FieldLabel>{t("b.look.hair")}</FieldLabel>
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
              {HAIRS.map((h) => {
                const active = avatar.hair === h;
                return (
                  <motion.button
                    key={h}
                    onClick={() => set({ hair: h })}
                    aria-pressed={active}
                    aria-label={t(`hair.${h}`)}
                    whileTap={{ scale: 0.9 }}
                    className={cn("rounded-2xl border-2 border-ink p-1", active ? "bg-sun shadow-pop-sm" : "bg-paper hover:bg-sun/30")}
                  >
                    <KidAvatar bust config={{ ...avatar, hair: h, extra: "none", glasses: false }} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel>{t("b.look.hairColor")}</FieldLabel>
            <Swatches colors={HAIR_COLORS} value={avatar.hairColor} onPick={(i) => set({ hairColor: i })} label={t("b.look.hairColor")} />
          </div>

          <div>
            <FieldLabel>{t("b.look.eyes")}</FieldLabel>
            <Swatches colors={EYES} value={avatar.eyes ?? 0} onPick={(i) => set({ eyes: i })} label={t("b.look.eyes")} />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["glasses", "freckles"] as const).map((key) => (
              <motion.button
                key={key}
                onClick={() => set({ [key]: !avatar[key] })}
                aria-pressed={!!avatar[key]}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "rounded-full border-2 border-ink px-4 py-2 text-sm font-bold",
                  avatar[key] ? "bg-mint shadow-pop-sm" : "bg-paper hover:bg-sun/30"
                )}
              >
                {key === "glasses" ? "👓" : "✨"} {t(`b.look.${key}`)}
              </motion.button>
            ))}
          </div>

          <div>
            <FieldLabel>{t("b.look.outfit")}</FieldLabel>
            <Swatches colors={OUTFITS} value={avatar.outfit} onPick={(i) => set({ outfit: i })} label={t("b.look.outfit")} />
          </div>

          <div>
            <FieldLabel>{t("b.look.extra")}</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {EXTRA_CHOICES.map((e) => {
                const active = avatar.extra === e;
                return (
                  <motion.button
                    key={e}
                    onClick={() => set({ extra: e })}
                    aria-pressed={active}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "rounded-full border-2 border-ink px-4 py-2 text-sm font-bold",
                      active ? "bg-sun shadow-pop-sm" : "bg-paper hover:bg-sun/30"
                    )}
                  >
                    {t(`extra.${e}`)}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Super-powers and the story's little lesson ---------- */
export function StepPowers() {
  const { t } = useLanguage();
  const { data, update, toggleTrait } = useStory();
  const name = useName();
  const full = data.traits.length >= MAX_TRAITS;

  return (
    <div className="mx-auto max-w-xl">
      <Guide mood={data.traits.length ? "happy" : "think"} title={t("b.powers.title", { name })} sub={t("b.powers.sub")} />

      <div className="space-y-9">
        <div>
          <FieldLabel hint={`${data.traits.length}/${MAX_TRAITS}`}>{t("b.powers.traits")}</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {traits.map((tr) => {
              const active = data.traits.includes(tr.id);
              return (
                <motion.button
                  key={tr.id}
                  onClick={() => toggleTrait(tr.id)}
                  aria-pressed={active}
                  disabled={!active && full}
                  whileTap={{ scale: 0.9 }}
                  animate={{ rotate: active ? [0, -4, 4, 0] : 0 }}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-2 text-sm font-bold disabled:opacity-35",
                    active ? "bg-sun shadow-pop-sm" : "bg-paper hover:bg-sun/30"
                  )}
                >
                  <span className="text-base">{tr.emoji}</span>
                  {t(`trait.${tr.id}`)}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <FieldLabel hint={t("b.optional")}>🧸 {t("b.powers.fav")}</FieldLabel>
          <input
            type="text"
            value={data.favorite}
            maxLength={24}
            autoComplete="off"
            onChange={(e) => update("favorite", e.target.value)}
            placeholder={t("b.powers.fav.ph")}
            className="w-full rounded-full border-2 border-ink bg-paper px-5 py-3 font-display text-lg font-semibold shadow-pop-sm outline-none transition-colors placeholder:font-normal placeholder:text-ink/40 focus:bg-sun/25"
          />
          <p className="mt-2 text-sm font-semibold text-ink/55">{t("b.powers.fav.hint")}</p>
        </div>

        <div>
          <FieldLabel>{t("b.powers.value")}</FieldLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {values.map((v) => {
              const active = data.value === v.id;
              return (
                <motion.button
                  key={v.id}
                  onClick={() => update("value", v.id)}
                  aria-pressed={active}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-3xl border-2 border-ink px-2 py-4 text-center",
                    active ? "bg-mint shadow-pop" : "bg-paper shadow-pop-sm"
                  )}
                >
                  <motion.span className="text-3xl" animate={active ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.4 }}>
                    {v.emoji}
                  </motion.span>
                  <span className="font-display font-semibold">{t(`value.${v.id}`)}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. Choose the world, meet the companion ---------- */
const MAX_MESSAGE = 200;

export function StepWorld() {
  const { t } = useLanguage();
  const { data, update } = useStory();
  const name = useName();
  const heroName = data.childName.trim() || t("common.heroWord");
  const theme = themeById(data.themeId);
  const [showNote, setShowNote] = useState(!!data.dedication);

  return (
    <div>
      <Guide
        buddy={theme?.buddy ?? "lumi"}
        mood={theme ? "happy" : "idle"}
        title={theme ? t(`buddy.${theme.buddy}.hello`, { name }) : t("b.world.title", { name })}
        sub={theme ? t("b.world.picked", { buddy: t(`buddy.${theme.buddy}.name`) }) : t("b.world.sub")}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {themes.map((th, i) => {
          const active = data.themeId === th.id;
          return (
            <motion.button
              key={th.id}
              onClick={() => update("themeId", th.id)}
              aria-pressed={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, rotate: active ? -2 : 0, scale: active ? 1.04 : 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 18 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              className={cn("relative overflow-hidden rounded-3xl border-2 border-ink bg-paper text-start", active ? "shadow-pop" : "shadow-pop-sm")}
            >
              <div className="flex h-28 items-end justify-center overflow-hidden pt-2" style={{ background: `linear-gradient(150deg, ${th.from}, ${th.to})` }}>
                <div className="w-24 translate-y-2">
                  <Buddy id={th.buddy} mood={active ? "happy" : "idle"} pokable={false} label={t(`buddy.${th.buddy}.name`)} />
                </div>
              </div>
              <div className="p-3">
                <div className="font-display text-[15px] font-semibold leading-tight">{t(`theme.${th.id}.title`, { name: heroName })}</div>
                <div className="mt-1 text-xs font-semibold leading-snug text-ink/60">{t(`theme.${th.id}.tagline`)}</div>
              </div>
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute end-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-mint"
                >
                  <Check className="h-4 w-4" strokeWidth={3.5} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* optional dedication */}
      <div className="mx-auto mt-8 max-w-xl">
        <button
          onClick={() => setShowNote((s) => !s)}
          aria-expanded={showNote}
          className="flex w-full items-center justify-between rounded-2xl border-2 border-ink bg-paper px-4 py-3 font-display font-semibold shadow-pop-sm"
        >
          <span>💌 {t("b.note.toggle")}</span>
          <motion.span animate={{ rotate: showNote ? 180 : 0 }}>
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {showNote && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 rounded-3xl border-2 border-ink bg-paper p-4">
                <textarea
                  value={data.dedication}
                  onChange={(e) => update("dedication", e.target.value.slice(0, MAX_MESSAGE))}
                  placeholder={t("b.note.ph", { name })}
                  aria-label={t("b.note.toggle")}
                  rows={3}
                  className="w-full resize-none bg-transparent font-display text-lg leading-relaxed outline-none placeholder:text-ink/35"
                />
                <div className="flex items-center gap-3 border-t-2 border-dashed border-ink/20 pt-3">
                  <input
                    type="text"
                    value={data.dedicationFrom}
                    maxLength={40}
                    onChange={(e) => update("dedicationFrom", e.target.value)}
                    placeholder={t("b.note.from")}
                    aria-label={t("b.note.from")}
                    className="min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-ink/40"
                  />
                  <span className="shrink-0 text-xs font-bold text-ink/45" dir="ltr">
                    {data.dedication.length}/{MAX_MESSAGE}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- the making-of screen ---------- */
export function Generating() {
  const { t } = useLanguage();
  const { data } = useStory();
  const name = useName();
  const [msg, setMsg] = useState(0);
  const theme = themeById(data.themeId);
  const cast = BUDDY_IDS.filter((b) => b !== theme?.buddy).slice(0, 4);

  useEffect(() => {
    const id = setInterval(() => setMsg((m) => (m + 1) % 4), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-4 text-center" role="status">
      <div className="flex items-end justify-center gap-1 sm:gap-3">
        {cast.slice(0, 2).map((b, i) => (
          <motion.div key={b} className="w-16 sm:w-20" animate={{ y: [0, -16, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }}>
            <Buddy id={b} mood="happy" pokable={false} watch={false} />
          </motion.div>
        ))}
        <motion.div className="w-28 sm:w-36" animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <KidAvatar config={data.avatar} pose="cheer" mood="happy" />
        </motion.div>
        {theme && (
          <motion.div className="w-20 sm:w-24" animate={{ y: [0, -16, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0.36 }}>
            <Buddy id={theme.buddy} mood="happy" flip pokable={false} watch={false} />
          </motion.div>
        )}
        {cast.slice(2, 3).map((b) => (
          <motion.div key={b} className="w-16 sm:w-20" animate={{ y: [0, -16, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0.54 }}>
            <Buddy id={b} mood="happy" flip pokable={false} watch={false} />
          </motion.div>
        ))}
      </div>

      <h2 className="mt-8 font-display text-3xl font-bold">{t("b.gen.title", { name })}</h2>
      <div className="mt-2 h-7">
        <AnimatePresence mode="wait">
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="font-semibold text-ink/70"
          >
            {t(`b.gen.${msg + 1}`, { name })}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-6 h-4 w-full max-w-sm overflow-hidden rounded-full border-2 border-ink bg-paper" dir="ltr">
        <motion.div
          className="h-full w-1/3 rounded-full bg-coral"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
