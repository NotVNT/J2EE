export const LANGUAGES = [
  {
    code: "vi",
    shortLabel: "VI",
    label: "Tiếng Việt",
    subtitle: "Ngôn ngữ mặc định",
    settingsLabel: "Tiếng Việt",
    changedMessageKey: "language.changed",
    subtitleKey: "language.viSubtitle",
    flag: "🇻🇳"
  },
  {
    code: "en",
    shortLabel: "EN",
    label: "English",
    subtitle: "Default language",
    settingsLabel: "English",
    changedMessageKey: "language.changed",
    subtitleKey: "language.enSubtitle",
    flag: "🇺🇸"
  }
];

export const DEFAULT_LANGUAGE_CODE = "en";

export function getLanguageInfo(code) {
  return LANGUAGES.find((language) => language.code === code) || LANGUAGES.find((language) => language.code === DEFAULT_LANGUAGE_CODE) || LANGUAGES[0];
}
