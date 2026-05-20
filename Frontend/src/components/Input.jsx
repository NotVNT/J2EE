import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import CustomSelect from "./CustomSelect.jsx";

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
          <CustomSelect
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            className={`${baseClass} pr-4`}
          />
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
