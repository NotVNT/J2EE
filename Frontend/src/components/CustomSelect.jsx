import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({ value, onChange, options = [], placeholder = "Chọn một tuỳ chọn", className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`${className} flex items-center justify-between gap-2 text-left cursor-pointer`}
      >
        <span className={`truncate flex-1 ${!selected ? "text-slate-400 dark:text-slate-500" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange({ target: { value: opt.value } });
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${String(opt.value) === String(value)
                    ? "bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 font-medium"
                    : "text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
