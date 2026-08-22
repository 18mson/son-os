import { useSettingsStore } from "@/store/settingsStore";
import { en } from "./locales/en";
import { id } from "./locales/id";
import { TranslationSchema, LanguageMeta, AppTranslationItem } from "./types";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "./config";

export * from "./types";
export * from "./config";

export const LOCALES: Record<string, TranslationSchema> = {
  en,
  id,
};

/**
 * Retrieve translation dictionary for a specific language code.
 * Falls back to default language (English) if the code is not found.
 */
export function getTranslation(lang?: string): TranslationSchema {
  if (lang && LOCALES[lang]) {
    return LOCALES[lang];
  }
  return LOCALES[DEFAULT_LANGUAGE] || en;
}

/**
 * Get translated app metadata (title & description).
 */
export function getAppTranslation(appId: string, lang?: string): AppTranslationItem | undefined {
  const dict = getTranslation(lang);
  return dict.apps[appId];
}

/**
 * React hook to access active language, translation dictionary, and language switcher.
 */
export function useTranslation() {
  const language = useSettingsStore((state) => state.language) || DEFAULT_LANGUAGE;
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const t = getTranslation(language);

  return {
    t,
    language,
    setLanguage,
    languages: SUPPORTED_LANGUAGES as LanguageMeta[],
  };
}
