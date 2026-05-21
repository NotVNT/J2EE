import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
import Input from "./Input.jsx";

const JAR_COLORS = [
  { value: "#8B5CF6", label: "Tím" },
  { value: "#10B981", label: "Xanh lá" },
  { value: "#F59E0B", label: "Vàng" },
  { value: "#EF4444", label: "Đỏ" },
  { value: "#3B82F6", label: "Xanh dương" },
  { value: "#EC4899", label: "Hồng" },
  { value: "#F97316", label: "Cam" },
  { value: "#06B6D4", label: "Xanh ngọc" },
  { value: "#6366F1", label: "Chàm" },
  { value: "#84CC16", label: "Xanh chuối" },
];

const JarForm = ({ initialData, isEditing = false, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    icon: "",
    color: "#8B5CF6",
    targetPercentage: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        icon: initialData.icon || "",
        color: initialData.color || "#8B5CF6",
        targetPercentage: initialData.targetPercentage?.toString() || "",
      });
    }
  }, [initialData]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên hũ.");
      return;
    }
    onSave({
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
      targetPercentage: parseFloat(form.targetPercentage) || 0,
    });
  };

  return (
    <div className="space-y-4">
      <EmojiPickerPopup
        icon={form.icon}
        onSelect={(emoji) => handleChange("icon", emoji)}
      />

      <Input
        value={form.name}
        onChange={({ target }) => handleChange("name", target.value)}
        label="Tên hũ"
        placeholder="VD: Sinh hoạt, Giải trí, Đầu tư"
        type="text"
      />

      {form.name === "Ví tổng" ? (
        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tỷ lệ của Ví tổng được <strong>tự động tính</strong> bằng phần trăm còn lại (100% - tổng các hũ khác).
          </p>
        </div>
      ) : (
        <Input
          value={form.targetPercentage}
          onChange={({ target }) => handleChange("targetPercentage", target.value.replace(/[^0-9.]/g, ""))}
          label="Tỷ lệ phân bổ (%)"
          placeholder="VD: 55"
          type="text"
        />
      )}

      {/* Color picker */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Màu sắc</label>
        <div className="flex flex-wrap gap-2">
          {JAR_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => handleChange("color", c.value)}
              className={`w-8 h-8 rounded-xl transition-[box-shadow,transform] duration-150 ${
                form.color === c.value
                  ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: c.value, ringColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-medium
            text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="add-btn add-btn-fill"
        >
          {isEditing ? "Cập nhật" : "Tạo hũ"}
        </button>
      </div>
    </div>
  );
};

export default JarForm;
