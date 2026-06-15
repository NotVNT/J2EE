import { createContext, useContext, useEffect, useMemo, useState } from "react";
import dictionaries from "../translations/index.js";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "../util/i18n.js";
import { applyStaticTranslations, observeStaticTranslations } from "../util/i18nDom.js";

const LanguageContext = createContext(null);

function getStoredLanguage() {
  try {
    return normalizeLanguage(localStorage.getItem("language") || DEFAULT_LANGUAGE);
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getStoredLanguage);

  useEffect(() => {
    try {
      localStorage.setItem("language", language);
    } catch {
      // Ignore storage failures; the in-memory language still works.
    }

    document.documentElement.lang = language === "en" ? "en" : "vi";
    applyStaticTranslations(document.getElementById("root"), dictionaries, language);
  }, [language]);

  useEffect(() => {
    const root = document.getElementById("root");
    return observeStaticTranslations(root, dictionaries, () => language);
  }, [language]);

  const value = useMemo(() => {
    const setAppLanguage = (nextLanguage) => {
      setLanguage(normalizeLanguage(nextLanguage));
    };

    const toggleLanguage = () => {
      setLanguage((currentLanguage) => (currentLanguage === "vi" ? "en" : "vi"));
    };

    return { language, setLanguage: setAppLanguage, toggleLanguage };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
