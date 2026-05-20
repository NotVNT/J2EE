import { useState, useEffect } from "react";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
import Input from "./Input.jsx";
import { formatCurrency, parseCurrency } from "../util/helper.js";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { AlertTriangle } from "lucide-react";

// Add 'categories' prop
const AddExpenseForm = ({ onAddExpense, categories }) => {
    const [expense, setExpense] = useState({ // Renamed 'income' state to 'expense' for clarity
        name: "",
        categoryId: "", // Changed from 'category' to 'categoryId'
        amount: "",
        date: "",
        icon: "", // Icon might be associated with the selected category, or kept separate for custom entries
        jarId: "",
    });
    const [jars, setJars] = useState([]);

    useEffect(() => {
        axiosConfig.get(API_ENDPOINTS.GET_JARS)
            .then((res) => { if (res.data) setJars(res.data); })
            .catch(() => {});
    }, []);

    // Effect to set a default category if categories are loaded and none is selected
    useEffect(() => {
        if (categories && categories.length > 0 && !expense.categoryId) {
            // Automatically select the first category as default if none is chosen
            setExpense((prev) => ({ ...prev, categoryId: categories[0].id })); // Use categories[0].id for MySQL
        }
    }, [categories, expense.categoryId]);

    useEffect(() => {
        if (jars.length > 0 && !expense.jarId) {
            setExpense((prev) => ({ ...prev, jarId: jars[0].id }));
        }
    }, [jars, expense.jarId]);

    const handleChange = (key, value) => setExpense({ ...expense, [key]: value }); // Changed setIncome to setExpense

    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        handleChange("amount", rawValue);
    };

    // Map categories to the format expected by the reusable Input dropdown
    const categoryOptions = categories.map((cat) => ({
        value: cat.id, // Correct for MySQL 'id'
        label: `${cat.name}`, // Display icon and name in dropdown
    }));

    const jarOptions = jars.map((j) => ({
        value: j.id,
        label: `🏦 ${j.name?.trim() || 'Hũ không tên'}`,
    }));

    const selectedJar = jars.find((j) => String(j.id) === String(expense.jarId));
    const parsedAmount = Number(expense.amount) || 0;
    const insufficientBalance = selectedJar && parsedAmount > (selectedJar.currentBalance ?? 0);

    return (
        <div>
            <EmojiPickerPopup
                icon={expense.icon} // Uses expense.icon now
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />

            <Input
                value={expense.name}
                onChange={({ target }) => handleChange("name", target.value)}
                label="Tên giao dịch"
                placeholder="VD: Tiền điện, Cáp quang"
                type="text"
            />

            {/* Replaced Input for 'Category' text with a dropdown for 'Category' */}
            <Input
                label="Danh mục"
                placeholder={categories.length === 0 ? "Vui lòng tạo danh mục chi tiêu trước" : "Chọn danh mục"}
                value={expense.categoryId}
                onChange={({ target }) => handleChange("categoryId", target.value)}
                isSelect={true}
                options={categoryOptions}
            />

            {/* Jar selection */}
            {jars.length > 0 && (
                <div className="mt-0">
                    <Input
                        label="Trừ từ hũ"
                        placeholder="Chọn hũ thanh toán"
                        value={expense.jarId}
                        onChange={({ target }) => handleChange("jarId", target.value)}
                        isSelect={true}
                        options={jarOptions}
                    />
                    {insufficientBalance && (
                        <div className="flex items-center gap-1.5 mt-1 px-1">
                            <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Số dư hũ không đủ ({new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedJar.currentBalance)})
                            </p>
                        </div>
                    )}
                </div>
            )}

            <Input
                value={formatCurrency(expense.amount)}
                onChange={handleAmountChange}
                label="Số tiền"
                placeholder="VD: 150.000"
                type="text"
            />

            <Input
                value={expense.date}
                onChange={({ target }) => handleChange("date", target.value)}
                label="Ngày"
                placeholder=""
                type="date"
            />

            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    className="add-btn add-btn-fill"
                    onClick={() => onAddExpense(expense)} // Changed income to expense
                >Thêm chi tiêu</button>
            </div>
        </div>
    );
};

export default AddExpenseForm;