import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center w-9 h-9 rounded-xl
        bg-slate-100 hover:bg-slate-200 text-slate-600
        dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-300
        transition duration-200 cursor-pointer ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
