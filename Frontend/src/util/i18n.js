export const DEFAULT_LANGUAGE = "vi";
export const SUPPORTED_LANGUAGES = ["vi", "en"];

export function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

export function resolveTranslation(dictionaries, language, key) {
  const normalizedLanguage = normalizeLanguage(language);
  const value = key
    .split(".")
    .reduce((current, segment) => current?.[segment], dictionaries[normalizedLanguage]);

  if (value != null) return value;

  if (normalizedLanguage !== DEFAULT_LANGUAGE) {
    const fallbackValue = key
      .split(".")
      .reduce((current, segment) => current?.[segment], dictionaries[DEFAULT_LANGUAGE]);
    if (fallbackValue != null) return fallbackValue;
  }

  return key;
}

function preserveWhitespace(original, translated) {
  const leadingWhitespace = original.match(/^\s*/)?.[0] || "";
  const trailingWhitespace = original.match(/\s*$/)?.[0] || "";
  return `${leadingWhitespace}${translated}${trailingWhitespace}`;
}

export function translatePhrase(dictionaries, language, text) {
  const normalizedLanguage = normalizeLanguage(language);
  if (normalizedLanguage === DEFAULT_LANGUAGE || typeof text !== "string") {
    return text;
  }

  const trimmedText = text.trim();
  if (!trimmedText) return text;

  const translated = dictionaries[normalizedLanguage]?.phrases?.[trimmedText];
  return translated ? preserveWhitespace(text, translated) : text;
}
