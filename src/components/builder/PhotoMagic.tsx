import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, RotateCcw } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { useStory } from "../../state/StoryContext";
import KidAvatar, { type AvatarConfig } from "../../characters/KidAvatar";
import { avatarFromPhoto, preparePhoto, type PhotoResult } from "../../characters/photoAvatar";
import { Button, Confetti } from "../ui";

type Phase = "idle" | "working" | "reveal" | "done";
const MAX_FILE = 12 * 1024 * 1024;

/**
 * "Photo magic": the parent picks a photo, agrees to its one-time use, and
 * watches it turn into their child's cartoon hero. The photo is held in
 * memory only while this card is on screen and is dropped right after.
 */
export default function PhotoMagic() {
  const { t } = useLanguage();
  const { data, update } = useStory();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState("");
  const [result, setResult] = useState<PhotoResult | null>(null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const name = data.childName.trim() || t("common.yourChildLower");

  useEffect(() => {
    if (phase !== "working") return;
    const id = setInterval(() => setTick((n) => n + 1), 1100);
    return () => clearInterval(id);
  }, [phase]);

  const forget = () => {
    setPhoto("");
    setResult(null);
  };

  const pick = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("photo.err.type");
    if (file.size > MAX_FILE) return setError("photo.err.size");
    setError("");
    setPhase("working");
    const started = Date.now();
    try {
      const prepared = await preparePhoto(file);
      setPhoto(prepared);
      const outcome = await avatarFromPhoto(prepared, data.avatar);
      // Let the transformation be seen, even when the answer is instant.
      const wait = 2600 - (Date.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      if (typeof outcome === "string") {
        forget();
        setError(outcome === "unusable" ? "photo.err.unusable" : "photo.err.failed");
        return setPhase("idle");
      }
      setResult(outcome);
      setPhase("reveal");
    } catch {
      forget();
      setError("photo.err.failed");
      setPhase("idle");
    }
  };

  const accept = (avatar: AvatarConfig) => {
    update("avatar", avatar);
    forget();
    setPhase("done");
  };

  return (
    <div className="relative mx-auto mb-8 max-w-4xl overflow-hidden rounded-[2rem] border-2 border-ink bg-sun/40 p-5 shadow-pop sm:p-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {phase === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
            <motion.div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-ink bg-coral text-5xl shadow-pop-sm"
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🪄
            </motion.div>
            <div>
              <h3 className="font-display text-2xl font-bold">{t("photo.title")}</h3>
              <p className="mt-1 font-semibold text-ink/70">{t("photo.sub", { name })}</p>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-ink bg-paper p-3">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#231942]" />
                <span className="text-sm font-semibold leading-snug text-ink/85">{t("photo.consent")}</span>
              </label>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="coral" onClick={() => inputRef.current?.click()} disabled={!consent}>
                  <Camera className="h-5 w-5" /> {t("photo.choose")}
                </Button>
                <span className="text-sm font-bold text-ink/55">{t("photo.or")}</span>
              </div>
              {error && (
                <p role="alert" className="mt-3 rounded-2xl border-2 border-ink bg-coral/40 px-4 py-2.5 text-sm font-bold">
                  {t(error)}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {phase === "working" && (
          <motion.div key="working" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-3 text-center" role="status">
            <div className="relative h-36 w-36">
              <motion.div
                aria-hidden
                className="absolute -inset-3 rounded-full border-[3px] border-dashed border-ink"
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-ink bg-paper">
                {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                <motion.div
                  aria-hidden
                  className="absolute inset-x-0 h-1.5 rounded-full bg-coral shadow-[0_0_14px_4px_rgba(255,122,107,0.7)]"
                  animate={{ top: ["8%", "88%", "8%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              {["✨", "🎨", "⭐"].map((e, i) => (
                <motion.span
                  key={e}
                  aria-hidden
                  className="absolute text-2xl"
                  style={{ top: `${[-6, 70, 20][i]}%`, left: `${[78, 92, -16][i]}%` }}
                  animate={{ scale: [0.6, 1.2, 0.6], rotate: [0, 20, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            <p className="mt-6 font-display text-xl font-semibold">{t(`photo.work${(tick % 3) + 1}`, { name })}</p>
          </motion.div>
        )}

        {phase === "reveal" && result && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex flex-col items-center text-center">
            <Confetti count={28} />
            <div className="flex items-center justify-center gap-3 sm:gap-6">
              <motion.img
                src={photo}
                alt=""
                initial={{ scale: 1.1 }}
                animate={{ scale: 0.82, rotate: -5 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="h-24 w-24 rounded-full border-2 border-ink object-cover sm:h-28 sm:w-28"
              />
              <motion.span
                aria-hidden
                className="text-3xl"
                animate={{ x: [0, 8, 0], scale: [1, 1.25, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ✨
              </motion.span>
              <motion.div
                initial={{ scale: 0, rotate: 40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 11, delay: 0.25 }}
                className="aspect-square w-32 overflow-hidden rounded-full border-2 border-ink bg-sky/60 shadow-pop sm:w-40"
              >
                <KidAvatar bust config={result.avatar} mood="happy" />
              </motion.div>
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold">{t("photo.reveal", { name })}</h3>
            <p className="mt-1 max-w-md text-sm font-semibold text-ink/70">{t(result.source === "ai" ? "photo.note.ai" : "photo.note.device")}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button variant="coral" onClick={() => accept(result.avatar)}>
                <Check className="h-5 w-5" strokeWidth={3} /> {t("photo.accept")}
              </Button>
              <Button
                variant="paper"
                onClick={() => {
                  forget();
                  setPhase("idle");
                }}
              >
                <RotateCcw className="h-4 w-4" /> {t("photo.retry")}
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-mint">
                <Check className="h-4 w-4" strokeWidth={3.5} />
              </span>
              {t("photo.done")}
            </p>
            <Button variant="paper" size="sm" onClick={() => setPhase("idle")}>
              <Camera className="h-4 w-4" /> {t("photo.again")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
