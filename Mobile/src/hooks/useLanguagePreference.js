import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { getDeviceLanguageCode, hydrateStoredLanguage, LANGUAGE_STORAGE_KEY } from "../i18n";
import { DEFAULT_LANGUAGE_CODE, getLanguageInfo } from "../constants/languages";

export default function useLanguagePreference() {
  const [languageCode, setLanguageCode] = useState(i18n.language || getDeviceLanguageCode() || DEFAULT_LANGUAGE_CODE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    hydrateStoredLanguage()
      .then((nextLanguageCode) => {
        if (!mounted) return;
        setLanguageCode(getLanguageInfo(nextLanguageCode).code);
      })
      .finally(() => {
        if (mounted) setLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const changeLanguage = useCallback(async (nextLanguageCode) => {
    const nextLanguage = getLanguageInfo(nextLanguageCode);
    setLanguageCode(nextLanguage.code);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage.code);
    await i18n.changeLanguage(nextLanguage.code);
    return nextLanguage;
  }, []);

  return {
    languageCode,
    language: getLanguageInfo(languageCode),
    loaded,
    changeLanguage
  };
}
