import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({ label, value, onChange, placeholder, type = "text", isSelect = false, options = [] }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {isSelect ? (
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 placeholder-slate-400 outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:24px_24px] bg-[right_12px_center] bg-no-repeat"
              value={value}
              onChange={onChange}
            >
              <option value="" disabled>{placeholder || "Select an option"}</option>
              {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
              ))}
            </select>
        ) : (
          <>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              type={type === "password" ? (showPassword ? "text" : "password") : type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
            />
            {type === "password" ? (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-600 transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
                type="button"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
