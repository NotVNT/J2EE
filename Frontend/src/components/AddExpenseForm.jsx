import { useState, useEffect } from "react";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
import Input from "./Input.jsx";
import { formatCurrency } from "../util/helper.js";
import { AlertTriangle } from "lucide-react";

const AddExpenseForm = ({ onAddExpense, categories, defaultJarId, jars = [], initialDate = "" }) => {
    const [expense, setExpense] = useState({
        name: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        amount: "",
        date: initialDate || "",
        icon: "",
        jarId: defaultJarId || (jars.length > 0 ? jars[0].id : ""),
    });

    useEffect(() => {
        if (initialDate) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExpense((prev) => ({ ...prev, date: initialDate }));
        }
    }, [initialDate]);

    const handleChange = (key, value) => setExpense({ ...expense, [key]: value });

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        handleChange("amount", rawValue);
    };

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: `${cat.name}`,
    }));

    const jarOptions = [
        { value: "", label: "Not assigned to jar" },
        ...jars.map((j) => ({ value: j.id, label: `🏦 ${j.name?.trim() || 'Unnamed jar'}` })),
    ];

    const selectedJar = jars.find((j) => String(j.id) === String(expense.jarId));
    const selectedCategoryId = expense.categoryId || categories[0]?.id || "";
    const parsedAmount = Number(expense.amount) || 0;
    const insufficientBalance = selectedJar && parsedAmount > (selectedJar.currentBalance ?? 0);

    return (
        <div>
            <EmojiPickerPopup
                icon={expense.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            <Input
                value={expense.name}
                onChange={({ target }) => handleChange("name", target.value)}
                label="Transaction name"
                placeholder="e.g. Electricity, Internet"
                type="text"
            />

            <Input
                label="Category"
                placeholder={categories.length === 0 ? "Please create an expense category first" : "Select category"}
                value={selectedCategoryId}
                onChange={({ target }) => handleChange("categoryId", target.value)}
                isSelect={true}
                options={categoryOptions}
            />

            {jars.length > 0 && (
                <div className="mt-0">
                    <Input
                        label="Deduct from jar"
                        placeholder="Select payment jar"
                        value={expense.jarId}
                        onChange={({ target }) => handleChange("jarId", target.value)}
                        isSelect={true}
                        options={jarOptions}
                    />
                    {insufficientBalance && (
                        <div className="flex items-center gap-1.5 mt-1 px-1">
                            <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Insufficient jar balance ({new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedJar.currentBalance)})
                            </p>
                        </div>
                    )}
                </div>
            )}

            <Input
                value={formatCurrency(expense.amount)}
                onChange={handleAmountChange}
                label="Amount"
                placeholder="e.g. 150,000"
                type="text"
            />

            <Input
                value={expense.date}
                onChange={({ target }) => handleChange("date", target.value)}
                label="Date"
                placeholder=""
                type="date"
            />

            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    className="add-btn add-btn-fill"
                    onClick={() => onAddExpense({ ...expense, categoryId: selectedCategoryId })}
                >Add expense</button>
            </div>
        </div>
    );
};

export default AddExpenseForm;
