import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { translations, type Locale } from "./translations";

type TranslateVariables = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (nextLocale: Locale) => void;
  t: (key: string, vars?: TranslateVariables) => string;
};

const DEFAULT_LOCALE: Locale = "pt";
const STORAGE_KEY = "weanimelist.locale";

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "pt";
}

function resolveKey(locale: Locale, key: string): string {
  const path = key.split(".");
  let current: unknown = translations[locale];

  for (const part of path) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return key;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : key;
}

function applyVariables(text: string, vars?: TranslateVariables): string {
  if (!vars) {
    return text;
  }

  return Object.entries(vars).reduce((accumulator, [name, value]) => {
    return accumulator.replaceAll(`{{${name}}}`, String(value));
  }, text);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const storedLocale =
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEY)
      : null;
  const [locale, setLocaleState] = useState<Locale>(
    isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE,
  );

  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => applyVariables(resolveKey(locale, key), vars),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
