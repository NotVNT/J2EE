import { useState, useEffect, useRef } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { getFieldsForIntent, INTENT_ICONS, INTENT_LABELS } from "../util/aiIntentParser.js";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

const CategorySelect = ({ value, onChange, options, required, disabled, placeholder = "-- Chọn danh mục --" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400 dark:focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selected ? "" : "text-slate-400 dark:text-slate-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <div
            className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/10"
            onClick={() => { onChange(""); setOpen(false); }}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/10 ${
                opt.value === value
                  ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                  : "text-slate-800 dark:text-slate-200"
              }`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
      {/* Hidden input for required validation */}
      {required && (
        <input
          tabIndex={-1}
          required
          value={value || ""}
          onChange={() => {}}
          className="absolute inset-0 opacity-0 pointer-events-none"
        />
      )}
    </div>
  );
};

const JarSelect = ({ value, onChange, options, required, disabled, placeholder = "-- Chọn hũ --" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400 dark:focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selected ? "" : "text-slate-400 dark:text-slate-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
          <div
            className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/10"
            onClick={() => { onChange(""); setOpen(false); }}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/10 ${
                opt.value === value
                  ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
                  : "text-slate-800 dark:text-slate-200"
              }`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
      {required && (
        <input
          tabIndex={-1}
          required
          value={value || ""}
          onChange={() => {}}
          className="absolute inset-0 opacity-0 pointer-events-none"
        />
      )}
    </div>
  );
};

const AIConfirmationForm = ({ intent, extractedFields, suggestedValues, confirmationPrompt, onConfirm, onCancel, isProcessing }) => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [categoriesByType, setCategoriesByType] = useState({});
  const [jars, setJars] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingJars, setLoadingJars] = useState(false);

  useEffect(() => {
    const fieldDefs = getFieldsForIntent(intent);
    const merged = { ...suggestedValues, ...extractedFields };
    setFields(fieldDefs);
    const initialData = {};
    fieldDefs.forEach((f) => {
      initialData[f.key] = merged[f.key] !== undefined ? merged[f.key] : "";
    });
    setFormData(initialData);

    const categoryTypes = [...new Set(
      fieldDefs
        .filter((f) => f.type === "category_select" && f.categoryType)
        .map((f) => f.categoryType)
    )];

    if (categoryTypes.length > 0) {
      setLoadingCategories(true);
      Promise.all(
        categoryTypes.map((catType) =>
          axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE(catType))
            .then((res) => setCategoriesByType((prev) => ({ ...prev, [catType]: res.data })))
            .catch(() => {})
        )
      ).finally(() => setLoadingCategories(false));
    }

    const hasJarSelect = fieldDefs.some((f) => f.type === "jar_select");
    if (hasJarSelect) {
      setLoadingJars(true);
      axiosConfig.get(API_ENDPOINTS.GET_JARS)
        .then((res) => setJars(res.data || []))
        .catch(() => {})
        .finally(() => setLoadingJars(false));
    }
  }, [intent, extractedFields, suggestedValues]);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(intent, { ...suggestedValues, ...extractedFields, ...formData });
  };

  const intentIcon = INTENT_ICONS[intent] || "🤖";
  const intentLabel = INTENT_LABELS[intent] || intent;

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 my-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{intentIcon}</span>
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">{intentLabel}</span>
      </div>

      {confirmationPrompt && (
        <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">{confirmationPrompt}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {field.type === "category_select" ? (
              <CategorySelect
                value={formData[field.key] || ""}
                onChange={(val) => handleFieldChange(field.key, val)}
                options={(categoriesByType[field.categoryType] || []).map((cat) => ({
                  value: cat.name,
                  label: `${cat.icon ? cat.icon + " " : ""}${cat.name}`
                }))}
                required={field.required}
                disabled={isProcessing || loadingCategories}
                placeholder={loadingCategories ? "Đang tải danh mục..." : undefined}
              />
            ) : field.type === "jar_select" ? (
              <JarSelect
                value={formData[field.key] || ""}
                onChange={(val) => handleFieldChange(field.key, val)}
                options={jars.map((jar) => ({
                  value: jar.name,
                  label: `${jar.icon ? jar.icon + " " : ""}${jar.name}${jar.currentBalance !== undefined ? " (" + jar.currentBalance.toLocaleString() + "đ)" : ""}`
                }))}
                required={field.required}
                disabled={isProcessing || loadingJars}
                placeholder={loadingJars ? "Đang tải hũ..." : undefined}
              />
            ) : field.type === "date" ? (
              <input
                type="date"
                value={formData[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                required={field.required}
                className="w-full rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400 dark:focus:border-amber-500"
              />
            ) : (
              <input
                type={field.type === "number" ? "number" : "text"}
                value={formData[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.label}
                required={field.required}
                min={field.type === "number" ? "0" : undefined}
                step={field.type === "number" ? "any" : undefined}
                className="w-full rounded-xl border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-amber-400 dark:focus:border-amber-500"
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check size={16} />
            )}
            Xác nhận
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIConfirmationForm;
