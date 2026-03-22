import { useState, useEffect } from "react";
import EmojiPickerPopup from "./EmojiPickerPopup.jsx";
import Input from "./Input.jsx";
import { formatCurrency, parseCurrency } from "../util/helper.js";

// Add 'categories' prop
const AddExpenseForm = ({ onAddExpense, categories }) => {
    const [expense, setExpense] = useState({ // Renamed 'income' state to 'expense' for clarity
        name: "",
        categoryId: "", // Changed from 'category' to 'categoryId'
        amount: "",
        date: "",
        icon: "", // Icon might be associated with the selected category, or kept separate for custom entries
    });

    // Effect to set a default category if categories are loaded and none is selected
    useEffect(() => {
        if (categories && categories.length > 0 && !expense.categoryId) {
            // Automatically select the first category as default if none is chosen
            setExpense((prev) => ({ ...prev, categoryId: categories[0].id })); // Use categories[0].id for MySQL
        }
    }, [categories, expense.categoryId]);

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