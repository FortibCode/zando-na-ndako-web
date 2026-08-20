"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Language } from "@/i18n/translations";

const LANGUAGE_KEY = "zando_language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === "fr" || saved === "lingala" || saved === "kituba" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  // Traduction avec repli en cascade vers le français, comme mobile/src/contexts/language-context.tsx.
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split(".");
      let value: unknown = translations[language];
      for (const k of keys) {
        if (value && typeof value === "object" && k in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[k];
        } else {
          let fallbackValue: unknown = translations.fr;
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === "object" && fk in (fallbackValue as Record<string, unknown>)) {
              fallbackValue = (fallbackValue as Record<string, unknown>)[fk];
            } else {
              return fallback || key;
            }
          }
          return typeof fallbackValue === "string" ? fallbackValue : fallback || key;
        }
      }
      return typeof value === "string" ? value : fallback || key;
    },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage doit être utilisé à l'intérieur d'un LanguageProvider");
  return ctx;
}
