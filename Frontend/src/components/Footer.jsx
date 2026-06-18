import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation.js";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className="text-xs font-semibold text-slate-500 transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
            >
              Giới thiệu
            </Link>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <Link
              to="/privacy"
              className="text-xs font-semibold text-slate-500 transition hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
            >
              Chính sách bảo mật
            </Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {currentYear} - {t("footer.builtBy")}{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              BotDev
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
