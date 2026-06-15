import { useState } from "react";
import DateInput from "./DateInput.jsx";
import { getTodayIsoDate, isIsoDateAfter, normalizeToIsoDate } from "../util/dateInput.js";

const buildInitialGoalForm = (initialData, isEditing) => {
    if (initialData && isEditing) {
        return {
            name: initialData.name || "",
            targetAmount: initialData.targetAmount || "",
            currentAmount: initialData.currentAmount || "",
            startDate: normalizeToIsoDate(initialData.startDate),
            targetDate: normalizeToIsoDate(initialData.targetDate),
        };
    }

    return {
        name: "",
        targetAmount: "",
        currentAmount: "",
        startDate: getTodayIsoDate(),
        targetDate: "",
    };
};

const SavingGoalForm = ({ initialData, isEditing, onSave, onCancel }) => {
    const [form, setForm] = useState(() => buildInitialGoalForm(initialData, isEditing));

    const handleChange = (key, value) => setForm({ ...form, [key]: value });

    const handleSubmit = () => {
        if (!form.name.trim()) { alert("Goal name cannot be empty"); return; }
        if (!form.targetAmount || Number(form.targetAmount) <= 0) { alert("Target amount must be greater than 0"); return; }
        if (!isEditing && Number(form.currentAmount) > Number(form.targetAmount)) { alert("Current amount cannot exceed target amount"); return; }
        if (!form.targetDate) { alert("Please select a deadline"); return; }
        if (isIsoDateAfter(form.startDate, form.targetDate)) { alert("Deadline must be on or after start date"); return; }

        const dto = {
            name: form.name.trim(),
            targetAmount: Number(form.targetAmount),
            startDate: form.startDate,
            targetDate: form.targetDate,
        };
        if (!isEditing) dto.currentAmount = Number(form.currentAmount) || 0;
        onSave(dto);
    };

    const fmt = (value) => {
        if (!value && value !== 0) return "";
        return Number(value).toLocaleString("vi-VN");
    };

    const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300";

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className={labelClass}>Goal name</label>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Japan trip"
                    className="form-input"
                />
            </div>

            <div>
                <label className={labelClass}>Target amount (VND)</label>
                <input
                    type="text"
                    value={fmt(form.targetAmount)}
                    onChange={(e) => handleChange("targetAmount", e.target.value.replace(/\D/g, ""))}
                    placeholder="VD: 20,000,000"
                    className="form-input"
                />
            </div>

            {!isEditing && (
                <div>
                    <label className={labelClass}>Initial amount already saved (VND)</label>
                    <input
                        type="text"
                        value={fmt(form.currentAmount)}
                        onChange={(e) => handleChange("currentAmount", e.target.value.replace(/\D/g, ""))}
                        placeholder="VD: 5,000,000"
                        className="form-input"
                    />
                </div>
            )}

            {!isEditing && (
                <div>
                    <label className={labelClass}>Start date</label>
                    <DateInput
                        value={form.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        className="form-input"
                    />
                </div>
            )}

            <div>
                <label className={labelClass}>Deadline</label>
                <DateInput
                    value={form.targetDate}
                    onChange={(e) => handleChange("targetDate", e.target.value)}
                    className="form-input"
                />
            </div>

            <div className="flex gap-3 mt-2">
                <button
                    onClick={handleSubmit}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                    {isEditing ? "Update" : "Create goal"}
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SavingGoalForm;
