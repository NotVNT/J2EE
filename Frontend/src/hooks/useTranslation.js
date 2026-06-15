import { useCallback } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import dictionaries from "../translations/index.js";
import { resolveTranslation, translatePhrase } from "../util/i18n.js";

export function useTranslation() {
  const { language } = useLanguage();

  const t = useCallback(
    (key) => resolveTranslation(dictionaries, language, key),
    [language]
  );

  const translate = useCallback(
    (text) => translatePhrase(dictionaries, language, text),
    [language]
  );

  return { language, t, translate };
}
