import { useState, useEffect } from "react";

const SavingGoalForm = ({ initialData, isEditing, onSave, onCancel }) => {
    const [form, setForm] = useState({
        name: "",
        targetAmount: "",
        currentAmount: "",
        startDate: new Date().toISOString().split("T")[0],
        targetDate: "",
    });

    useEffect(() => {
        if (initialData && isEditing) {
            setForm({
                name: initialData.name || "",
                targetAmount: initialData.targetAmount || "",
                currentAmount: initialData.currentAmount || "",
                startDate: initialData.startDate || "",
                targetDate: initialData.targetDate || "",
            });
        }
    }, [initialData, isEditing]);

    const handleChange = (key, value) => setForm({ ...form, [key]: value });

    const handleSubmit = () => {
        if (!form.name.trim()) {
            alert("Tên mục tiêu không được để trống");
            return;
        }
        if (!form.targetAmount || Number(form.targetAmount) <= 0) {
            alert("Số tiền mục tiêu phải lớn hơn 0");
            return;
        }
        if (!isEditing && Number(form.currentAmount) > Number(form.targetAmount)) {
            alert("Số tiền hiện có không được lớn hơn số tiền mục tiêu");
            return;
        }
        if (!form.targetDate) {
            alert("Hãy chọn hạn chót");
            return;
        }
        if (form.targetDate < form.startDate) {
            alert("Hạn chót phải lớn hơn hoặc bằng ngày bắt đầu");
            return;
        }

        const dto = {
            name: form.name.trim(),
            targetAmount: Number(form.targetAmount),
            startDate: form.startDate,
            targetDate: form.targetDate,
        };
        if (!isEditing) {
            dto.currentAmount = Number(form.currentAmount) || 0;
        }
        onSave(dto);
    };

    const fmt = (v) => {
        if (!v && v !== 0) return "";
        return Number(v).toLocaleString("vi-VN");
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Tên mục tiêu */}
            <div>
                <label className="text-xs text-slate-800 font-medium">Tên mục tiêu</label>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="VD: Du lịch Nhật Bản"
                    className="form-input"
                />
            </div>

            {/* Số tiền mục tiêu */}
            <div>
                <label className="text-xs text-slate-800 font-medium">Số tiền mục tiêu (VND)</label>
                <input
                    type="text"
                    value={fmt(form.targetAmount)}
                    onChange={(e) => handleChange("targetAmount", e.target.value.replace(/\D/g, ""))}
                    placeholder="VD: 20,000,000"
                    className="form-input"
                />
            </div>

            {/* Số tiền ban đầu */}
            {!isEditing && (
                <div>
                    <label className="text-xs text-slate-800 font-medium">Số tiền hiện có ban đầu (VND)</label>
                    <input
                        type="text"
                        value={fmt(form.currentAmount)}
                        onChange={(e) => handleChange("currentAmount", e.target.value.replace(/\D/g, ""))}
                        placeholder="VD: 5,000,000"
                        className="form-input"
                    />
                </div>
            )}

            {/* Ngày bắt đầu */}
            {!isEditing && (
                <div>
                    <label className="text-xs text-slate-800 font-medium">Ngày bắt đầu</label>
                    <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        className="form-input"
                    />
                </div>
            )}

            {/* Hạn chót */}
            <div>
                <label className="text-xs text-slate-800 font-medium">Hạn chót</label>
                <input
                    type="date"
                    value={form.targetDate}
                    onChange={(e) => handleChange("targetDate", e.target.value)}
                    className="form-input"
                />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-2">
                <button
                    onClick={handleSubmit}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                    {isEditing ? "Cập nhật" : "Tạo mục tiêu"}
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                    Huỷ
                </button>
            </div>
        </div>
    );
};

export default SavingGoalForm;
