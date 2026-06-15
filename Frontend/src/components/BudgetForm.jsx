import { useState } from "react";
import Input from "./Input.jsx";
import { formatCurrency } from "../util/helper.js";

/**
 * BudgetForm – Form for setting a budget limit
 * Props:
 *   categories  – list of "expense" type categories
 *   onSave      – callback(dto) on submit
 *   onCancel    – callback when Cancel is clicked
 */
const BudgetForm = ({ categories = [], onSave, onCancel }) => {
    const now = new Date();

    const [form, setForm] = useState({
        categoryId: "",
        amountLimit: "",
        month: now.getMonth() + 1,
        year: now.getFullYear(),
    });

    const handleChange = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        handleChange("amountLimit", value);
    };

    const selectedCategoryId = form.categoryId || categories[0]?.id || "";

    const handleSubmit = () => {
        if (!selectedCategoryId) return alert("Please select a category");
        if (!form.amountLimit || Number(form.amountLimit) <= 0)
            return alert("Budget limit must be greater than 0");

        onSave({
            categoryId: Number(selectedCategoryId),
            amountLimit: Number(form.amountLimit),
            month: Number(form.month),
            year: Number(form.year),
        });
    };

    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: c.name,
    }));

    // Month list
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: `Month ${i + 1}`,
    }));

    // Year list (3 nearest years)
    const currentYear = now.getFullYear();
    const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map(
        (y) => ({ value: y, label: `${y}` })
    );

    return (
        <div className="budget-form">
            <Input
                label="Expense category"
                value={selectedCategoryId}
                onChange={({ target }) => handleChange("categoryId", target.value)}
                isSelect
                options={categoryOptions}
                placeholder={
                    categories.length === 0
                        ? "No expense categories yet, please create one first"
                        : "Select category"
                }
            />

            <Input
                label="Limit (VND)"
                type="text"
                value={formatCurrency(form.amountLimit)}
                onChange={handleAmountChange}
                placeholder="e.g. 2,000,000"
            />

            <div className="budget-form__row">
                <div className="budget-form__half">
                    <Input
                        label="Month"
                        value={form.month}
                        onChange={({ target }) => handleChange("month", target.value)}
                        isSelect
                        options={monthOptions}
                    />
                </div>
                <div className="budget-form__half">
                    <Input
                        label="Year"
                        value={form.year}
                        onChange={({ target }) => handleChange("year", target.value)}
                        isSelect
                        options={yearOptions}
                    />
                </div>
            </div>

            <div className="budget-form__actions">
                <button
                    type="button"
                    className="add-btn"
                    onClick={onCancel}
                    id="budget-form-cancel-btn"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="add-btn add-btn-fill"
                    onClick={handleSubmit}
                    id="budget-form-save-btn"
                    disabled={categories.length === 0}
                >
                    Save limit
                </button>
            </div>
        </div>
    );
};

export default BudgetForm;
