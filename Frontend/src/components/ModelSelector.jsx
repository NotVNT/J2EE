const DEFAULT_OPTIONS = [
  { value: "gptoss",     label: "🤖 GPT-OSS 120B" },
  { value: "ninerouter", label: "🔬 EXPERIMENTAL" },
];

const ModelSelector = ({ value, onChange, disabled, label = "Chat model", options = DEFAULT_OPTIONS }) => {
  return (
    <div className="flex items-center gap-2.5 w-full">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-shrink-0 whitespace-nowrap">
        {label}
      </span>
      <div className="relative flex-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          title={disabled ? "Chỉ khả dụng cho gói PREMIUM" : "Chọn model AI"}
          className="w-full appearance-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 pl-3 pr-8 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer transition hover:border-amber-400 dark:hover:border-amber-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-1 focus:ring-amber-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-400 dark:text-slate-500">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      {disabled && (
        <span className="text-[10px] font-semibold text-amber-500 dark:text-amber-400 flex-shrink-0 border border-amber-300 dark:border-amber-500/40 rounded-md px-1.5 py-0.5">
          PREMIUM
        </span>
      )}
    </div>
  );
};

export default ModelSelector;
