import { useState, useEffect, useContext } from "react";
import axiosConfig from "../../util/axiosConfig";
import toast from "react-hot-toast";
import { Plus, UserPlus, Receipt, ArrowRightLeft, Wallet, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { API_ENDPOINTS } from "../../util/apiEndpoints";
import { AppContext } from "../../context/AppContext";

const GroupDetail = ({ group, onUpdate }) => {
    const { user } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState("expenses");
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showSettle, setShowSettle] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newExpense, setNewExpense] = useState({
        amount: "", description: "", date: new Date().toISOString().split("T")[0], splitType: "EQUAL"
    });
    const [newSettlement, setNewSettlement] = useState({ payerId: "", payeeId: "", amount: "", note: "" });

    useEffect(() => {
        if (group?.id) {
            fetchMembers();
            fetchExpenses();
            fetchBalances();
            fetchSettlements();
        }
    }, [group]);

    const fetchMembers = async () => {
        try {
            const res = await axiosConfig.get(API_ENDPOINTS.GET_GROUP_MEMBERS(group.id));
            setMembers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchExpenses = async () => {
        try {
            const res = await axiosConfig.get(API_ENDPOINTS.GET_GROUP_EXPENSES(group.id));
            setExpenses(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchBalances = async () => {
        try {
            const res = await axiosConfig.get(API_ENDPOINTS.GET_GROUP_BALANCES(group.id));
            setBalances(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchSettlements = async () => {
        try {
            const res = await axiosConfig.get(API_ENDPOINTS.GET_GROUP_SETTLEMENTS(group.id));
            setSettlements(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await axiosConfig.post(API_ENDPOINTS.ADD_GROUP_MEMBER(group.id), { email: newMemberEmail });
            toast.success("Đã thêm thành viên!");
            setNewMemberEmail("");
            setShowAddMember(false);
            fetchMembers();
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || "Thêm thất bại");
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await axiosConfig.post(API_ENDPOINTS.ADD_GROUP_EXPENSE(group.id), newExpense);
            toast.success("Đã thêm chi tiêu nhóm!");
            setShowAddExpense(false);
            setNewExpense({ amount: "", description: "", date: new Date().toISOString().split("T")[0], splitType: "EQUAL" });
            fetchExpenses();
            fetchBalances();
        } catch (error) {
            toast.error(error.response?.data?.message || "Thêm thất bại");
        }
    };

    const handleSettle = async (e) => {
        e.preventDefault();
        try {
            await axiosConfig.post(API_ENDPOINTS.ADD_GROUP_SETTLEMENT(group.id), newSettlement);
            toast.success("Đã ghi nhận thanh toán!");
            setShowSettle(false);
            setNewSettlement({ payerId: "", payeeId: "", amount: "", note: "" });
            fetchBalances();
            fetchSettlements();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ghi nhận thất bại");
        }
    };

    const tabs = [
        { key: "expenses", label: "Chi tiêu", icon: Receipt },
        { key: "balances", label: "Số dư", icon: Wallet },
        { key: "settlements", label: "Thanh toán", icon: ArrowRightLeft },
    ];

    return (
        <div className="space-y-6">
            {/* Group Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{group.avatarIcon || "👥"}</span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{group.name}</h2>
                            <p className="text-sm text-slate-500">{group.description || "Không có mô tả"} • {group.memberCount} thành viên</p>
                        </div>
                    </div>
                    {group.myRole === "ADMIN" && (
                        <button
                            onClick={() => setShowAddMember(true)}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <UserPlus size={16} /> Mời thành viên
                        </button>
                    )}
                </div>

                {/* Members avatars */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                    {members.map(m => (
                        <div key={m.profileId} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg text-xs text-slate-700 border border-slate-100">
                            <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                                {m.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                            {m.fullName}
                            {m.role === "ADMIN" && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-sm font-bold">Admin</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab.key ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content: Expenses */}
            {activeTab === "expenses" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => setShowAddExpense(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                            <Plus size={16} /> Thêm chi tiêu
                        </button>
                    </div>
                    {expenses.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                            <Receipt size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 text-sm">Chưa có chi tiêu nào trong nhóm</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {expenses.map(exp => (
                                <div key={exp.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{exp.description}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Thanh toán bởi <span className="font-medium text-indigo-600">{exp.paidByName}</span> • {new Date(exp.date).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        <span className="text-lg font-bold text-rose-600">{Number(exp.amount).toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {exp.splits?.map(s => (
                                            <div key={s.id} className={`text-xs px-2 py-1 rounded-lg border ${s.isPaid ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"}`}>
                                                {s.memberName}: {Number(s.amount).toLocaleString()}đ {s.isPaid ? "✓" : ""}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab Content: Balances */}
            {activeTab === "balances" && (
                <div className="space-y-3">
                    {balances.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                            <Wallet size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 text-sm">Chưa có dữ liệu số dư</p>
                        </div>
                    ) : balances.map(b => (
                        <div key={b.memberId} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                                    {b.memberName?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm">{b.memberName}</h4>
                                    <p className="text-xs text-slate-500">Đã trả: {Number(b.totalPaid).toLocaleString()}đ • Phải trả: {Number(b.totalOwed).toLocaleString()}đ</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-bold flex items-center gap-1 ${b.netBalance > 0 ? "text-emerald-600" : b.netBalance < 0 ? "text-rose-600" : "text-slate-500"}`}>
                                    {b.netBalance > 0 ? <TrendingUp size={16} /> : b.netBalance < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
                                    {b.netBalance > 0 ? "+" : ""}{Number(b.netBalance).toLocaleString()}đ
                                </div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                    {b.netBalance > 0 ? "Được trả lại" : b.netBalance < 0 ? "Cần trả thêm" : "Cân bằng"}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <button onClick={() => setShowSettle(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                            <ArrowRightLeft size={16} /> Ghi nhận thanh toán
                        </button>
                    </div>
                </div>
            )}

            {/* Tab Content: Settlements */}
            {activeTab === "settlements" && (
                <div className="space-y-3">
                    {settlements.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                            <ArrowRightLeft size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 text-sm">Chưa có thanh toán nào được ghi nhận</p>
                        </div>
                    ) : settlements.map(s => (
                        <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-indigo-600">{s.payerName}</span>
                                    <ArrowRightLeft size={14} className="text-slate-400" />
                                    <span className="font-semibold text-emerald-600">{s.payeeName}</span>
                                </div>
                                {s.note && <p className="text-xs text-slate-500 mt-1">{s.note}</p>}
                                <p className="text-xs text-slate-400 mt-1">{new Date(s.settledAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                            <span className="text-lg font-bold text-emerald-600">{Number(s.amount).toLocaleString()}đ</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Mời thành viên</h3>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email" required value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddMember(false)} className="px-4 py-2 rounded-xl text-sm text-slate-600 bg-slate-100 hover:bg-slate-200">Huỷ</button>
                                <button type="submit" className="px-4 py-2 rounded-xl text-sm text-white bg-indigo-600 hover:bg-indigo-700">Mời</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
            {showAddExpense && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Thêm chi tiêu nhóm</h3>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                                <input type="text" required value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm"
                                    placeholder="Vd: Tiền ăn trưa" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền</label>
                                    <input type="number" required min="0" value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm"
                                        placeholder="0 đ" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày</label>
                                    <input type="date" required value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cách chia</label>
                                <select value={newExpense.splitType}
                                    onChange={(e) => setNewExpense({ ...newExpense, splitType: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm bg-white">
                                    <option value="EQUAL">Chia đều</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddExpense(false)} className="px-4 py-2 rounded-xl text-sm text-slate-600 bg-slate-100 hover:bg-slate-200">Huỷ</button>
                                <button type="submit" className="px-4 py-2 rounded-xl text-sm text-white bg-indigo-600 hover:bg-indigo-700">Thêm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Settlement Modal */}
            {showSettle && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Ghi nhận thanh toán</h3>
                        <form onSubmit={handleSettle} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Người trả</label>
                                <select required value={newSettlement.payerId}
                                    onChange={(e) => setNewSettlement({ ...newSettlement, payerId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm bg-white">
                                    <option value="">Chọn người trả</option>
                                    {members.map(m => (
                                        <option key={m.profileId} value={m.profileId}>{m.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Người nhận</label>
                                <select required value={newSettlement.payeeId}
                                    onChange={(e) => setNewSettlement({ ...newSettlement, payeeId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm bg-white">
                                    <option value="">Chọn người nhận</option>
                                    {members.filter(m => m.profileId !== Number(newSettlement.payerId)).map(m => (
                                        <option key={m.profileId} value={m.profileId}>{m.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền</label>
                                <input type="number" required min="0" value={newSettlement.amount}
                                    onChange={(e) => setNewSettlement({ ...newSettlement, amount: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm"
                                    placeholder="0 đ" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú (tuỳ chọn)</label>
                                <input type="text" value={newSettlement.note}
                                    onChange={(e) => setNewSettlement({ ...newSettlement, note: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-hidden text-sm"
                                    placeholder="Vd: Chuyển khoản" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowSettle(false)} className="px-4 py-2 rounded-xl text-sm text-slate-600 bg-slate-100 hover:bg-slate-200">Huỷ</button>
                                <button type="submit" className="px-4 py-2 rounded-xl text-sm text-white bg-emerald-600 hover:bg-emerald-700">Ghi nhận</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetail;
