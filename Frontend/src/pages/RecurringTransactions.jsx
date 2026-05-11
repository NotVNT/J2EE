import { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit, Calendar, RefreshCw, Power, Crown } from "lucide-react";
import { API_ENDPOINTS, BASE_URL } from "../util/apiEndpoints";
import { AppContext } from "../context/AppContext";
import Dashboard from "../components/Dashboard";
import RecurringTransactionForm from "../components/RecurringTransactionForm";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { usePageTitle } from "../hooks/usePageTitle";

const RecurringTransactions = () => {
    useUser();
    usePageTitle("Giao dịch định kỳ");
    const { user, token } = useContext(AppContext);
    const [transactions, setTransactions] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && token && user.subscriptionPlan === "PREMIUM") {
            fetchTransactions();
        }
    }, [user, token]);

    const fetchTransactions = async () => {
        try {
            const res = await axios.get(BASE_URL + API_ENDPOINTS.RECURRING_TRANSACTIONS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(res.data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách giao dịch định kỳ");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xoá giao dịch này?")) return;
        try {
            await axios.delete(BASE_URL + API_ENDPOINTS.DELETE_RECURRING_TRANSACTION(id), {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Xoá thành công");
            fetchTransactions();
        } catch (error) {
            toast.error("Xoá thất bại");
        }
    };

    const handleToggle = async (id) => {
        try {
            await axios.patch(BASE_URL + API_ENDPOINTS.TOGGLE_RECURRING_TRANSACTION(id), {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTransactions();
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại");
        }
    };

    if (user?.subscriptionPlan !== "PREMIUM") {
        return (
            <Dashboard activeMenu="Giao dịch định kỳ">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-200 dark:border-white/10">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Tính năng Premium</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Giao dịch định kỳ là tính năng tự động tạo thu/chi theo chu kỳ. Vui lòng nâng cấp lên gói Premium để sử dụng.
                        </p>
                        <button
                            onClick={() => navigate("/payment")}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-medium shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                        >
                            Nâng cấp ngay
                        </button>
                    </div>
                </div>
            </Dashboard>
        );
    }

    return (
        <Dashboard activeMenu="Giao dịch định kỳ">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tự động hoá</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Các giao dịch này sẽ tự động thêm vào lịch sử của bạn</p>
                    </div>
                    <button
                        onClick={() => { setEditTransaction(null); setIsFormOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Thêm mới
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transactions.map(t => (
                        <div key={t.id} className={`bg-white dark:bg-white/5 rounded-2xl border p-5 transition-all ${t.isActive ? "border-slate-200 dark:border-white/10 shadow-sm" : "border-slate-100 dark:border-white/5 opacity-60"}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{t.icon || "💰"}</div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white">{t.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.categoryName}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`font-bold ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                                        {t.type === "INCOME" ? "+" : "-"}{Number(t.amount).toLocaleString()}đ
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-sm">
                                        {t.frequency}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-xl mb-4 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-slate-400" />
                                    Bắt đầu: {new Date(t.startDate).toLocaleDateString("vi-VN")}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <RefreshCw size={14} className={t.isActive ? "text-indigo-500" : "text-slate-400"} />
                                    Tiếp theo: <span className={t.isActive ? "text-indigo-600 font-medium" : ""}>{new Date(t.nextRunDate).toLocaleDateString("vi-VN")}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                                <button 
                                    onClick={() => handleToggle(t.id)}
                                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${t.isActive ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10" : "text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-white/5"}`}
                                >
                                    <Power size={14} /> {t.isActive ? "Đang chạy" : "Tạm dừng"}
                                </button>
                                
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditTransaction(t); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 border-dashed">
                            <RefreshCw size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <h3 className="text-slate-700 dark:text-slate-300 font-medium">Chưa có giao dịch định kỳ</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">Tự động hoá các khoản thu/chi lặp đi lặp lại của bạn</p>
                            <button onClick={() => { setEditTransaction(null); setIsFormOpen(true); }} className="text-indigo-600 text-sm font-medium hover:underline">
                                Tạo mới ngay
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isFormOpen && (
                <RecurringTransactionForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchTransactions();
                    }}
                    editData={editTransaction}
                />
            )}
        </Dashboard>
    );
};

export default RecurringTransactions;
