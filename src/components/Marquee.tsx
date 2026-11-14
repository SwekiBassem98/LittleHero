import { useLanguage } from "../i18n/LanguageContext";

/** Tilted band of looping words between the hero and the rest of the page. */
export default function Marquee() {
  const { t } = useLanguage();
  const words = t("marquee.words").split("|");
  const row = [...words, ...words];

  return (
    <div className="relative z-10 -my-4 -rotate-1 overflow-hidden border-y-2 border-ink bg-ink py-4" dir="ltr" aria-hidden>
      <div className="flex w-max animate-marquee">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {row.map((item, i) => (
              <span
                key={i}
                className="mx-5 flex items-center gap-3 font-display text-2xl font-semibold text-white"
              >
                {item}
                <span className="ms-5 text-sun">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
