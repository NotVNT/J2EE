import { useState, useEffect } from "react";
import axiosConfig from "../util/axiosConfig";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { API_ENDPOINTS } from "../util/apiEndpoints";

const RecurringTransactionForm = ({ isOpen, onClose, onSuccess, editData }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        type: "EXPENSE",
        categoryId: "",
        amount: "",
        frequency: "MONTHLY",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        icon: "💰"
    });

    useEffect(() => {
        fetchCategories();
        if (editData) {
            setFormData({
                name: editData.name,
                type: editData.type,
                categoryId: editData.categoryId,
                amount: editData.amount,
                frequency: editData.frequency,
                startDate: editData.startDate,
                endDate: editData.endDate || "",
                icon: editData.icon || "💰"
            });
        }
    }, [editData]);

    const fetchCategories = async () => {
        try {
            const res = await axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES);
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editData) {
                await axiosConfig.put(API_ENDPOINTS.UPDATE_RECURRING_TRANSACTION(editData.id), formData);
                toast.success("Cập nhật thành công");
            } else {
                await axiosConfig.post(API_ENDPOINTS.RECURRING_TRANSACTIONS, formData);
                toast.success("Thêm mới thành công");
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">
                        {editData ? "Sửa giao dịch định kỳ" : "Thêm giao dịch định kỳ"}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                            className={`py-2 rounded-xl text-sm font-medium transition-all ${
                                formData.type === "EXPENSE" 
                                ? "bg-rose-100 text-rose-700 border-rose-200 shadow-sm" 
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-transparent"
                            } border`}
                        >
                            Chi tiêu
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "INCOME" })}
                            className={`py-2 rounded-xl text-sm font-medium transition-all ${
                                formData.type === "INCOME" 
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm" 
                                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-transparent"
                            } border`}
                        >
                            Thu nhập
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên giao dịch</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-sm"
                            placeholder="Vd: Tiền điện hàng tháng"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-sm"
                                placeholder="0 đ"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                            <select
                                required
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-sm bg-white"
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.filter(c => c.type === formData.type).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Chu kỳ lặp lại</label>
                        <select
                            value={formData.frequency}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-sm bg-white"
                        >
                            <option value="DAILY">Hàng ngày</option>
                            <option value="WEEKLY">Hàng tuần</option>
                            <option value="MONTHLY">Hàng tháng</option>
                            <option value="YEARLY">Hàng năm</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ngày kết thúc (tuỳ chọn)</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                        >
                            {editData ? "Cập nhật" : "Lưu giao dịch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecurringTransactionForm;
