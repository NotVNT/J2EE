import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center justify-center w-9 h-9 rounded-xl
        bg-slate-100 hover:bg-slate-200 text-slate-600
        dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-300
        transition duration-200 cursor-pointer overflow-hidden ${className}`}
      aria-label="Toggle theme"
      type="button"
    >
      {/* Sun Icon */}
      <div className={`absolute transition-all duration-500 ease-out transform
        ${theme === "dark" 
          ? "opacity-100 rotate-0 scale-100" 
          : "opacity-0 -rotate-90 scale-50 pointer-events-none"}`}
      >
        <Sun size={17} />
      </div>

      {/* Moon Icon */}
      <div className={`absolute transition-all duration-500 ease-out transform
        ${theme === "dark" 
          ? "opacity-0 rotate-90 scale-50 pointer-events-none" 
          : "opacity-100 rotate-0 scale-100"}`}
      >
        <Moon size={17} />
      </div>
    </button>
  );
}

