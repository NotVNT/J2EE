import { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Users, Crown, ArrowRight, ChevronLeft } from "lucide-react";
import { API_ENDPOINTS, BASE_URL } from "../util/apiEndpoints";
import { AppContext } from "../context/AppContext";
import Dashboard from "../components/Dashboard";
import GroupDetail from "../components/group/GroupDetail";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { usePageTitle } from "../hooks/usePageTitle";

const GroupBudget = () => {
    useUser();
    usePageTitle("Nhóm chi tiêu");
    const { user, token } = useContext(AppContext);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: "", description: "", avatarIcon: "👥" });
    const navigate = useNavigate();

    useEffect(() => {
        if (user && token && user.subscriptionPlan === "PREMIUM") {
            fetchGroups();
        }
    }, [user, token]);

    const fetchGroups = async () => {
        try {
            const res = await axios.get(BASE_URL + API_ENDPOINTS.GET_GROUPS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(res.data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách nhóm");
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post(BASE_URL + API_ENDPOINTS.CREATE_GROUP, newGroup, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Tạo nhóm thành công!");
            setIsCreating(false);
            setNewGroup({ name: "", description: "", avatarIcon: "👥" });
            fetchGroups();
        } catch (error) {
            toast.error(error.response?.data?.message || "Tạo nhóm thất bại");
        }
    };

    if (user?.subscriptionPlan !== "PREMIUM") {
        return (
            <Dashboard activeMenu="Nhóm chi tiêu">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="bg-white dark:bg-white/5 p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-200 dark:border-white/10">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Tính năng Premium</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Nhóm chi tiêu giúp bạn chia sẻ và quản lý chi phí chung với bạn bè, gia đình. Nâng cấp Premium để sử dụng.
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

    // If a group is selected, show GroupDetail
    if (selectedGroup) {
        return (
            <Dashboard activeMenu="Nhóm chi tiêu">
                <div className="max-w-6xl mx-auto">
                    <button 
                        onClick={() => setSelectedGroup(null)}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-4 transition-colors"
                    >
                        <ChevronLeft size={16} /> Quay lại danh sách nhóm
                    </button>
                    <GroupDetail group={selectedGroup} onUpdate={fetchGroups} />
                </div>
            </Dashboard>
        );
    }

    const icons = ["👥", "🏠", "✈️", "🎉", "🍔", "💼", "🎓", "⚽"];

    return (
        <Dashboard activeMenu="Nhóm chi tiêu">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nhóm của bạn</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Chia sẻ chi phí với bạn bè, gia đình hoặc đồng nghiệp</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Tạo nhóm
                    </button>
                </div>

                {/* Group list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map(g => (
                        <div 
                            key={g.id}
                            onClick={() => setSelectedGroup(g)}
                            className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-5 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md cursor-pointer transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{g.avatarIcon || "👥"}</span>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{g.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{g.description || "Không có mô tả"}</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors mt-1" />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <Users size={14} className="text-slate-400" />
                                    {g.memberCount} thành viên
                                </div>
                                <span className={`px-2 py-0.5 rounded-md font-medium ${g.myRole === "ADMIN" ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400" : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"}`}>
                                    {g.myRole === "ADMIN" ? "Quản trị" : "Thành viên"}
                                </span>
                            </div>
                        </div>
                    ))}
                    {groups.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 border-dashed">
                            <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <h3 className="text-slate-700 dark:text-slate-300 font-medium">Chưa có nhóm nào</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">Tạo nhóm để bắt đầu chia sẻ chi phí với mọi người</p>
                            <button onClick={() => setIsCreating(true)} className="text-indigo-600 text-sm font-medium hover:underline">
                                Tạo nhóm đầu tiên
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Group Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tạo nhóm mới</h3>
                        </div>
                        <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Biểu tượng</label>
                                <div className="flex gap-2 flex-wrap">
                                    {icons.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setNewGroup({ ...newGroup, avatarIcon: icon })}
                                            className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${
                                                newGroup.avatarIcon === icon ? "bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500 scale-110" : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                                            }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên nhóm</label>
                                <input
                                    type="text"
                                    required
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-sm bg-white dark:bg-white/5 text-slate-800 dark:text-white"
                                    placeholder="Vd: Nhóm đi chơi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mô tả (tuỳ chọn)</label>
                                <textarea
                                    value={newGroup.description}
                                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                    rows={2}
                                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-sm resize-none bg-white dark:bg-white/5 text-slate-800 dark:text-white"
                                    placeholder="Mô tả ngắn về nhóm..."
                                />
                            </div>
                            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/10 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                                    Huỷ
                                </button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none transition-all">
                                    Tạo nhóm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Dashboard>
    );
};

export default GroupBudget;
