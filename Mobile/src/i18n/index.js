import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import vi from "../locales/vi.json";

export const LANGUAGE_STORAGE_KEY = "selected_language";
export const SUPPORTED_LANGUAGE_CODES = ["en", "vi"];
export const FALLBACK_LANGUAGE_CODE = "en";

export function normalizeLanguageCode(languageCode) {
  const baseCode = languageCode?.split?.("-")?.[0]?.toLowerCase?.();
  return SUPPORTED_LANGUAGE_CODES.includes(baseCode) ? baseCode : null;
}

export function getDeviceLanguageCode() {
  const locale = getLocales()?.[0];
  return normalizeLanguageCode(locale?.languageCode || locale?.languageTag) || FALLBACK_LANGUAGE_CODE;
}

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    vi: { translation: vi }
  },
  lng: getDeviceLanguageCode(),
  fallbackLng: FALLBACK_LANGUAGE_CODE,
  interpolation: {
    escapeValue: false
  }
});

export async function hydrateStoredLanguage() {
  const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  const nextLanguageCode = normalizeLanguageCode(storedLanguage) || getDeviceLanguageCode();

  if (i18n.language !== nextLanguageCode) {
    await i18n.changeLanguage(nextLanguageCode);
  }

  return nextLanguageCode;
}

export default i18n;
