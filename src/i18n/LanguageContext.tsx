import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { translations } from "./translations";

export type Language = "fr" | "ar";
export type TParams = Record<string, string | number>;
export type TFn = (key: string, params?: TParams) => string;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TFn;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);
const STORAGE_KEY = "littlehero-lang";

function initialLang(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "ar") return saved;
  } catch {
    /* storage unavailable */
  }
  return "fr";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = translations[lang]["meta.title"] ?? document.title;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang]);

  const t = useCallback<TFn>(
    (key, params) => {
      let value = translations[lang][key] ?? translations.fr[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.split(`{${k}}`).join(String(v));
        }
      }
      return value;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/** Human age label with correct plural forms in both languages. */
export function ageLabel(t: TFn, age: number) {
  if (age === 0) return t("age.baby");
  if (age === 1) return t("age.one");
  if (age === 2) return t("age.two");
  return t("age.many", { n: age });
}
