import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({ label, value, onChange, placeholder, type = "text" }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 outline-none transition focus:border-slate-400"
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {type === "password" ? (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            onClick={() => setShowPassword((prev) => !prev)}
            type="button"
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Input;
