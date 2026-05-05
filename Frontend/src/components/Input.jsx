import { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

const Input = ({ label, value, onChange, placeholder, type = "text", isSelect = false, options = [] }) => {
  const [showPassword, setShowPassword] = useState(false);

  const baseClass = `w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors
    bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10
    text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
    focus:border-violet-500 dark:focus:border-amber-500
    focus:ring-1 focus:ring-violet-500/30 dark:focus:ring-amber-500/30`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      )}
      <div className="relative">
        {isSelect ? (
          <>
            <select
              className={`${baseClass} appearance-none pr-10 cursor-pointer`}
              value={value}
              onChange={onChange}
            >
              <option value="" disabled className="text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800">
                {placeholder || "Chọn một tuỳ chọn"}
              </option>
              {options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"
            />
          </>
        ) : (
          <>
            <input
              className={`${baseClass} ${type === "password" ? "pr-11" : ""}`}
              type={type === "password" ? (showPassword ? "text" : "password") : type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
            />
            {type === "password" && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
                type="button"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
