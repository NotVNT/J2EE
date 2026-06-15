import { Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function LanguageToggle({ className = "" }) {
  const { language, toggleLanguage } = useLanguage();
  const nextLanguageLabel = language === "vi" ? "English" : "Tiếng Việt";

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center justify-center gap-1.5 w-14 h-9 rounded-xl
        bg-slate-100 hover:bg-slate-200 text-slate-600
        dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-300
        transition duration-200 cursor-pointer text-xs font-bold ${className}`}
      aria-label={`Switch to ${nextLanguageLabel}`}
      title={`Switch to ${nextLanguageLabel}`}
      type="button"
      data-no-translate
    >
      <Languages size={15} />
      {language === "vi" ? "EN" : "VI"}
    </button>
  );
}
