import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Download, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useStory } from "../state/StoryContext";
import StoryCover from "../components/StoryCover";
import Buddy from "../characters/Buddy";
import { Button, Confetti } from "../components/ui";
import { themeById } from "../data";
import { cn } from "../utils/cn";
import { startPayment, usePaymentConfig } from "./payments";
import { money, offerById, offers, type Offer } from "./pricing";

type Fields = "email" | "name" | "address" | "city" | "zip" | "country";
const addressFields: Fields[] = ["name", "address", "city", "zip", "country"];
const autoComplete: Record<Fields, string> = {
  email: "email",
  name: "name",
  address: "street-address",
  city: "address-level2",
  zip: "postal-code",
  country: "country-name",
};

/** Choose an offer, give the few details it needs, pay, celebrate. */
export default function Checkout() {
  const { t, lang } = useLanguage();
  const { checkoutFor, closeCheckout, completePurchase, receipt, printStory } = useStory();
  const config = usePaymentConfig();
  const live = !!config?.live;
  const [offerId, setOfferId] = useState<Offer["id"]>("pack");
  const [form, setForm] = useState<Record<Fields, string>>({ email: "", name: "", address: "", city: "", zip: "", country: "" });
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<"form" | "paying" | "failed">("form");

  const story = checkoutFor;
  useEffect(() => {
    if (story) {
      setPhase("form");
      setTouched(false);
    }
  }, [story?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!story) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && phase !== "paying" && closeCheckout();
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [story, phase, closeCheckout]);

  if (!story) return null;

  const paid = receipt && receipt.storyId === story.id ? receipt : null;
  const offer = offerById(paid ? paid.offerId : offerId);
  // With Stripe live, a printed book can only be sold once printing is set up.
  const bookBlocked = live && !config?.printEnabled;
  const total = offer.price + offer.shipping;
  const theme = themeById(story.themeId);
  const name = story.hero.name;

  // Stripe's own page collects the e-mail and address; our form is only for demo mode.
  const errors: Partial<Record<Fields, string>> = {};
  if (live) {
    /* nothing to validate here */
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = form.email.trim() ? "co.err.email" : "co.err.required";
  if (!live && offer.needsAddress) addressFields.forEach((f) => !form[f].trim() && (errors[f] = "co.err.required"));
  const shown = touched ? errors : {};

  const submit = async () => {
    if (Object.keys(errors).length) {
      setTouched(true);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('#checkout [aria-invalid="true"]')?.focus());
      return;
    }
    setPhase("paying");
    const outcome = await startPayment({ offerId: offer.id, storyId: story.id, title: story.story.title, lang });
    if (outcome.kind === "failed") return setPhase("failed");
    if (outcome.kind === "paid") {
      completePurchase({ storyId: story.id, offerId: offer.id, reference: outcome.reference });
      setPhase("form");
    }
    // "redirect": the browser is on its way to Stripe; keep the waiting screen.
  };

  const field = (key: Fields, type = "text") => (
    <label key={key} className={cn("block", (key === "address" || key === "email" || key === "name") && "sm:col-span-2")}>
      <span className="mb-1 block text-sm font-bold text-ink/70">{t(`co.f.${key}`)}</span>
      <input
        type={type}
        value={form[key]}
        autoComplete={autoComplete[key]}
        aria-invalid={!!shown[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={cn(
          "w-full rounded-2xl border-2 border-ink bg-paper px-4 py-3 font-semibold outline-none transition-colors focus:bg-sun/25",
          shown[key] && "border-coral bg-coral/15"
        )}
      />
      {shown[key] && <span className="mt-1 block text-sm font-bold text-[#c2331f]">{t(shown[key]!)}</span>}
    </label>
  );

  return (
    <AnimatePresence>
      <motion.div
        key="checkout"
        id="checkout"
        role="dialog"
        aria-modal="true"
        aria-label={t("co.title")}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="dots fixed inset-0 z-[140] flex flex-col bg-cream text-ink"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-ink bg-paper px-4 py-3">
          <h1 className="font-display text-xl font-semibold">{t("co.title")}</h1>
          <button
            onClick={closeCheckout}
            disabled={phase === "paying"}
            className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-cream px-3 py-1.5 font-display text-sm font-semibold transition-colors hover:bg-sun disabled:opacity-30"
          >
            <X className="h-4 w-4" />
            {t("common.close")}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {paid ? (
            <div className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-10 text-center">
              <Confetti count={44} />
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: -4 }} transition={{ type: "spring", stiffness: 180, damping: 11 }} className="w-44">
                <StoryCover name={name} themeId={story.themeId} avatar={story.hero.avatar} title={story.story.title} />
              </motion.div>
              <h2 className="mt-8 font-display text-4xl font-bold">🎉 {t("co.done.title")}</h2>
              <p className="mt-2 text-lg font-semibold text-ink/75">{t(`co.done.${offer.id}`, { name, n: offer.credits })}</p>
              {paid.reference.startsWith("DEMO") && (
                <p className="mt-5 rounded-2xl border-2 border-ink bg-sun/50 px-4 py-3 text-sm font-bold">ℹ️ {t("co.demo.done")}</p>
              )}
              <p className="mt-3 text-xs font-bold text-ink/45" dir="ltr">
                {paid.reference}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="coral" onClick={closeCheckout}>
                  {t("co.done.read")} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                </Button>
                <Button
                  variant="sun"
                  onClick={() => {
                    closeCheckout();
                    printStory(story);
                  }}
                >
                  <Download className="h-5 w-5" /> {t("pdf.download")}
                </Button>
              </div>
              <p className="mt-4 text-sm text-ink/55">{t("pdf.hint")}</p>
            </div>
          ) : phase === "paying" ? (
            <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center" role="status">
              <motion.div className="w-32" animate={{ y: [0, -14, 0] }} transition={{ duration: 0.7, repeat: Infinity }}>
                <Buddy id={theme?.buddy ?? "lumi"} mood="happy" pokable={false} watch={false} />
              </motion.div>
              <h2 className="mt-6 font-display text-2xl font-bold">{t("co.paying")}</h2>
            </div>
          ) : (
            <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="space-y-8">
                {/* offers */}
                <div>
                  <h2 className="font-display text-2xl font-bold">{t("co.choose", { name })}</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {offers.map((o, i) => {
                      const active = o.id === offerId;
                      const blocked = o.needsAddress && bookBlocked;
                      return (
                        <motion.button
                          key={o.id}
                          onClick={() => setOfferId(o.id)}
                          disabled={blocked}
                          aria-pressed={active}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: active ? -6 : 0 }}
                          transition={{ delay: i * 0.06, type: "spring", stiffness: 240, damping: 18 }}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            "relative flex flex-col rounded-3xl border-2 border-ink p-4 text-start disabled:opacity-50",
                            active ? `${o.color} shadow-pop` : "bg-paper shadow-pop-sm"
                          )}
                        >
                          {o.popular && (
                            <span className="absolute -top-3 start-4 -rotate-3 rounded-full border-2 border-ink bg-coral px-2.5 py-0.5 text-xs font-bold">
                              ⭐ {t("offer.popular")}
                            </span>
                          )}
                          <span className="text-3xl">{o.emoji}</span>
                          <span className="mt-2 font-display text-lg font-semibold leading-tight">{t(`offer.${o.id}.name`)}</span>
                          <span className="text-sm font-semibold text-ink/65">{t(`offer.${o.id}.desc`)}</span>
                          <ul className="mt-3 flex-1 space-y-1.5">
                            {t(`offer.${o.id}.f`).split("|").map((feat) => (
                              <li key={feat} className="flex items-start gap-1.5 text-sm font-semibold text-ink/80">
                                <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                                {feat}
                              </li>
                            ))}
                          </ul>
                          <span className="mt-4 font-display text-2xl font-bold" dir="ltr">
                            {money(o.price)}
                          </span>
                          {blocked && <span className="mt-1 text-sm font-bold">{t("co.book.soon")}</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* details: only in demo mode — Stripe asks for them on its own page */}
                {!live && (
                  <div className="rounded-3xl border-2 border-ink bg-paper p-5 shadow-pop-sm">
                    <h3 className="font-display text-xl font-semibold">{t(offer.needsAddress ? "co.details.book" : "co.details")}</h3>
                    <p className="mt-1 text-sm font-semibold text-ink/60">{t("co.email.why")}</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {field("email", "email")}
                      {offer.needsAddress && addressFields.map((f) => field(f))}
                    </div>
                  </div>
                )}

                {/* payment */}
                <div className={cn("rounded-3xl border-2 border-ink p-5", live ? "bg-mint/40" : "border-dashed bg-sun/30")}>
                  <h3 className="font-display text-xl font-semibold">{live ? "🔒" : "💳"} {t("co.pay.title")}</h3>
                  <p className="mt-1 font-semibold text-ink/75">{t(live ? "co.pay.live" : "co.demo")}</p>
                </div>
                {phase === "failed" && (
                  <p role="alert" className="rounded-2xl border-2 border-ink bg-coral/40 px-4 py-3 font-bold">
                    {t("co.failed")}
                  </p>
                )}
              </div>

              {/* summary */}
              <aside>
                <div className="sticky top-2 rounded-3xl border-2 border-ink bg-paper p-5 shadow-pop">
                  <div className="flex items-center gap-3">
                    <StoryCover name={name} themeId={story.themeId} avatar={story.hero.avatar} title={story.story.title} className="w-16 shrink-0 !shadow-pop-sm" />
                    <div className="min-w-0">
                      <div className="font-display font-semibold leading-tight">{story.story.title}</div>
                      <div className="text-sm font-semibold text-ink/60">{t(`offer.${offer.id}.name`)}</div>
                    </div>
                  </div>
                  <dl className="mt-5 space-y-2 border-t-2 border-dashed border-ink/20 pt-4 font-semibold">
                    <div className="flex justify-between">
                      <dt className="text-ink/70">{t(`offer.${offer.id}.name`)}</dt>
                      <dd dir="ltr">{money(offer.price)}</dd>
                    </div>
                    {offer.needsAddress && (
                      <div className="flex justify-between">
                        <dt className="text-ink/70">{t("co.shipping")}</dt>
                        <dd dir="ltr">{money(offer.shipping)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t-2 border-ink pt-3 font-display text-xl font-bold">
                      <dt>{t("co.total")}</dt>
                      <dd dir="ltr">{money(total)}</dd>
                    </div>
                  </dl>
                  <Button variant="coral" className="mt-5 w-full" onClick={submit} disabled={!config || (offer.needsAddress && bookBlocked)}>
                    {t("co.pay")} · <span dir="ltr">{money(total)}</span>
                  </Button>
                  <ul className="mt-4 space-y-1.5 text-sm font-bold text-ink/65">
                    <li>♾️ {t("co.perk1")}</li>
                    <li>🖨️ {t("co.perk2")}</li>
                    <li>💝 {t("co.perk3")}</li>
                  </ul>
                </div>
              </aside>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
