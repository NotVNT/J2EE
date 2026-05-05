import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";
import InfoCard from "../components/InfoCard.jsx";
import { Coins, PiggyBank, Target, Wallet, WalletCards, Sparkles, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, DollarSign, Calendar, PieChart } from "lucide-react";
import { addThousandsSeparator } from "../util/util.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import RecentTransactions from "../components/RecentTransactions.jsx";
import FinanceOverview from "../components/FinanceOverview.jsx";
import Transactions from "../components/Transactions.jsx";

const Home = () => {
    useUser();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [aiInsight, setAiInsight] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [showDetailedInsight, setShowDetailedInsight] = useState(false);
    const [detailedInsight, setDetailedInsight] = useState(null);
    const [detailedLoading, setDetailedLoading] = useState(false);

    const AI_INSIGHT_ENDPOINT = "/dashboard/ai-insight";
    const AI_DETAILED_INSIGHT_ENDPOINT = "/dashboard/ai-insight/detailed";

    const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

    const fetchDashboardData = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.DASHBOARD_DATA);
            if (response.status === 200) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error("Something went wrong while fetching dashboard data:", error);
            toast.error("Không thể tải dữ liệu thống kê!");
        } finally {
            setLoading(false);
        }
    };

    const fetchAiInsight = async () => {
        if (aiLoading) return;
        setAiLoading(true);

        try {
            const response = await axiosConfig.get(AI_INSIGHT_ENDPOINT);

            if (response.status === 200) {
                if (response.data.error) {
                    console.error("AI insight error:", response.data.error);
                    setAiInsight(response.data.insight || "Đang cập nhật dữ liệu...");
                } else if (response.data.insight) {
                    setAiInsight(response.data.insight);
                } else {
                    setAiInsight("Chưa có dữ liệu để phân tích. Hãy thêm giao dịch đầu tiên!");
                }
            }
        } catch (error) {
            console.error("Something went wrong while fetching AI insight:", error);
            if (error.response?.status === 401) {
                setAiInsight("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            } else if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || "Dữ liệu không hợp lệ";
                setAiInsight(errorMessage);
            } else {
                setAiInsight("Hệ thống AI đang bảo trì hoặc chưa có đủ dữ liệu, bạn quay lại sau nhé.");
            }
        } finally {
            setAiLoading(false);
        }
    };

    const fetchDetailedInsight = async () => {
        if (detailedLoading) return;
        setDetailedLoading(true);

        try {
            const response = await axiosConfig.get(AI_DETAILED_INSIGHT_ENDPOINT);

            if (response.status === 200) {
                if (response.data.error) {
                    toast.error(response.data.message || "Không thể tải phân tích chi tiết");
                    setDetailedInsight(null);
                } else if (response.data.status === "insufficient_data") {
                    toast.custom((t) => (
                        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-lg max-w-md">
                            <p className="font-semibold">⚠️ Chưa đủ dữ liệu</p>
                            <p className="text-sm mt-1">{response.data.message || "Hãy thêm nhiều giao dịch hơn!"}</p>
                        </div>
                    ));
                    setDetailedInsight(null);
                } else {
                    setDetailedInsight(response.data);
                }
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn!");
                setDetailedInsight(null);
            } else if (error.response?.status === 403) {
                toast.error("Bạn không có quyền truy cập tính năng này!");
                setDetailedInsight(null);
            } else {
                toast.error("Không thể tải phân tích chi tiết!");
                setDetailedInsight(null);
            }
        } finally {
            setDetailedLoading(false);
        }
    };

    const { user } = useContext(AppContext);

    const toggleDetailedInsight = () => {
        if (!showDetailedInsight) {
            if (user?.canUseDetailedAi === false) {
                toast.error("Tính năng phân tích chuyên sâu chỉ dành cho hội viên. Vui lòng nâng cấp tài khoản!");
                return;
            }
            if (!detailedInsight && !detailedLoading) {
                fetchDetailedInsight();
            }
        }
        setShowDetailedInsight(!showDetailedInsight);
    };

    useEffect(() => {
        const token = getToken();
        if (!token) {
            setAiInsight("Vui lòng đăng nhập để sử dụng tính năng AI!");
        } else {
            fetchDashboardData();
            fetchAiInsight();
        }
    }, []);

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "0 VND";
        const num = typeof amount === 'object' ? 0 : Number(amount);
        if (isNaN(num)) return "0 VND";
        return addThousandsSeparator(Math.floor(num)) + " VND";
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case "CAO": return "text-red-300 bg-red-900/40 border border-red-500/50";
            case "TRUNG_BÌNH": return "text-yellow-300 bg-yellow-900/40 border border-yellow-500/50";
            default: return "text-green-300 bg-green-900/40 border border-green-500/50";
        }
    };

    const safeNumber = (value) => {
        if (!value && value !== 0) return 0;
        return value;
    };

    return (
        <Dashboard activeMenu="Tổng quan">
            {/* AI Assistant Banner */}
            <section className="relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-primary via-secondary to-primary-container group mb-8 shadow-md">
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer w-full" onClick={toggleDetailedInsight}>
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                                    <Sparkles className={`w-6 h-6 ${aiLoading ? "animate-spin text-yellow-300" : "text-white"}`} />
                                </div>
                                <h2 className="text-white text-2xl font-bold tracking-tight">Trợ lý AI Tiền Trí</h2>
                            </div>
                            
                            {aiLoading ? (
                                <p className="text-white/80 text-lg leading-relaxed mb-1 animate-pulse">Đang phân tích thói quen chi tiêu của bạn...</p>
                            ) : (
                                <p className="text-white text-lg font-medium leading-relaxed mb-1 drop-shadow-sm line-clamp-2">
                                    {aiInsight || "Hãy thêm vài giao dịch mới để AI có thể đưa ra dự đoán cho bạn nhé!"}
                                </p>
                            )}
                        </div>
                        
                        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center gap-2 w-fit">
                            {showDetailedInsight ? "Thu gọn phân tích" : "Xem phân tích chi tiết"}
                            {showDetailedInsight ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                        </button>
                    </div>

                    {/* Detailed Insight Expanded */}
                    <div className={`w-full transition-all duration-300 overflow-hidden ${showDetailedInsight ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                        <div className="border-t border-white/20 pt-6">
                            {detailedLoading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin mb-4"></div>
                                    <p className="text-white/80 font-medium">Đang trích xuất dữ liệu tài chính sâu hơn...</p>
                                </div>
                            ) : detailedInsight ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Forecast */}
                                    {detailedInsight.forecast && (
                                        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                                            <div className="flex items-center gap-3 mb-4">
                                                <TrendingUp className="text-green-300 w-6 h-6" />
                                                <h4 className="font-bold text-lg text-white">Dự báo dòng tiền</h4>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full inline-flex text-xs font-bold uppercase tracking-wider mb-4 ${getRiskColor(detailedInsight.forecast.riskLevel)}`}>
                                                Mức độ rủi ro: {detailedInsight.forecast.riskLevel === "CAO" ? "Cao" : detailedInsight.forecast.riskLevel === "TRUNG_BÌNH" ? "Trung bình" : "Thấp"}
                                            </div>
                                            <p className="text-white/80 text-sm mb-4 leading-relaxed">{detailedInsight.forecast.riskMessage}</p>
                                            
                                            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                                <div>
                                                    <p className="text-white/50 text-xs mb-1">Thu nhập dự kiến</p>
                                                    <p className="text-white font-bold">{formatCurrency(detailedInsight.forecast.predictedNextMonthIncome)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/50 text-xs mb-1">Chi tiêu dự kiến</p>
                                                    <p className="text-white font-bold">{formatCurrency(detailedInsight.forecast.predictedNextMonthExpense)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Advice */}
                                    {detailedInsight.detailedAdvice && (
                                        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 md:col-span-2">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Sparkles className="text-pink-300 w-6 h-6" />
                                                <h4 className="font-bold text-lg text-white">Lời khuyên chiến lược</h4>
                                            </div>
                                            <div className="text-white/90 whitespace-pre-line text-sm leading-relaxed p-4 bg-white/5 rounded-2xl italic border-l-4 border-pink-400">
                                                "{detailedInsight.detailedAdvice}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-white/70 text-center py-6">Không có dữ liệu phân tích chi tiết khả dụng.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/50 rounded-full blur-[120px] pointer-events-none"></div>
            </section>

            {/* Statistics Cards Grid */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                <InfoCard onClick={() => navigate('/income')} icon={<WalletCards size={24}/>} label="Số dư" value={formatCurrency(safeNumber(dashboardData?.totalBalance))} color="bg-[#f0f4f8] text-[#1a237e]" />
                <InfoCard onClick={() => navigate('/income')} icon={<TrendingUp size={24}/>} label="Thu nhập" value={formatCurrency(safeNumber(dashboardData?.totalIncome))} color="bg-[#e6f4ea] text-[#1e8e3e]" />
                <InfoCard onClick={() => navigate('/expense')} icon={<AlertTriangle size={24}/>} label="Chi tiêu" value={formatCurrency(safeNumber(dashboardData?.totalExpense))} color="bg-[#fce8e6] text-[#d93025]" />
                <InfoCard onClick={() => navigate('/saving-goals')} icon={<Target size={24}/>} label="Đang thực hiện" value={safeNumber(dashboardData?.savingGoalActiveCount)} color="bg-[#f3e8fd] text-[#6100c6]" />
                <InfoCard onClick={() => navigate('/saving-goals')} icon={<PiggyBank size={24}/>} label="Tích lũy" value={formatCurrency(safeNumber(dashboardData?.savingGoalTotalSaved))} color="bg-[#e8f0fe] text-[#1967d2]" />
                <InfoCard onClick={() => navigate('/saving-goals')} icon={<PieChart size={24}/>} label="Hoàn thành" value={safeNumber(dashboardData?.savingGoalCompletedCount)} color="bg-[#e6f4ea] text-[#1e8e3e]" />
            </section>

            {/* Main Layout (8-col Left, 4-col Right) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Left Column */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Tổng quan thu chi (Bar Chart Layout Wrapper) */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-[0_2px_10px_0_rgba(25,28,30,0.02)] border border-[#E5E7EB]/50 flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-[#191c1e]">Tổng quan thu chi</h3>
                            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-[#191c1e]/50">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#6100c6]/40"></div>Thu nhập
                                </span>
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#1a237e]"></div>Chi tiêu
                                </span>
                            </div>
                        </div>
                        {/* Custom Bar Chart using Real Data */}
                        <div className="flex-1 flex items-end justify-between px-4 pb-2">
                            {dashboardData?.monthlyHistory?.map((h, i) => {
                                const maxVal = Math.max(...dashboardData.monthlyHistory.map(m => Math.max(Number(m.income), Number(m.expense))), 1);
                                const incomeH = (Number(h.income) / maxVal) * 100;
                                const expenseH = (Number(h.expense) / maxVal) * 100;
                                
                                return (
                                    <div key={i} className="w-16 h-full flex items-end gap-1.5 justify-center relative group">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                                            Thu: {formatCurrency(h.income)}<br/>Chi: {formatCurrency(h.expense)}
                                        </div>
                                        <div className={`w-6 bg-[#6100c6]/30 rounded-t-md hover:bg-[#6100c6] transition-all`} style={{height: `${Math.max(incomeH, 2)}%`}}></div>
                                        <div className={`w-6 bg-[#1a237e]/90 rounded-t-md hover:bg-[#1a237e] transition-all`} style={{height: `${Math.max(expenseH, 2)}%`}}></div>
                                        <span className="absolute -bottom-6 text-xs text-[#191c1e]/40 font-bold">{h.month}</span>
                                    </div>
                                );
                            })}
                            {(!dashboardData?.monthlyHistory || dashboardData.monthlyHistory.length === 0) && (
                                <div className="w-full h-full flex items-center justify-center text-[#191c1e]/40 font-medium">
                                    Đang tổng hợp dữ liệu lịch sử...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Giao dịch gần đây */}
                    <RecentTransactions transactions={dashboardData?.recentTransactions || []} onMore={() => navigate("/expense")} />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    {/* Cơ cấu tài chính (Pie Chart) - Optimized height for legend */}
                    <div className="h-[480px]">
                        <FinanceOverview
                            totalBalance={safeNumber(dashboardData?.totalBalance)}
                            totalIncome={safeNumber(dashboardData?.totalIncome)}
                            totalExpense={safeNumber(dashboardData?.totalExpense)}
                        />
                    </div>
                    
                    {/* Ngân sách tháng này */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-[0_2px_10px_0_rgba(25,28,30,0.02)] border border-[#E5E7EB]/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#191c1e]">Ngân sách tháng này</h3>
                            <button onClick={() => navigate('/budget')} className="text-sm font-bold text-blue-600 hover:text-blue-800">Cài đặt</button>
                        </div>
                        <div className="space-y-6">
                            {dashboardData?.budgets && dashboardData.budgets.length > 0 ? (
                                dashboardData.budgets.slice(0, 3).map((budget, idx) => {
                                    const ratio = (Number(budget.totalSpent) / Number(budget.amountLimit)) * 100;
                                    const isWarning = ratio >= 80 && ratio < 100;
                                    const isExceeded = ratio >= 100;
                                    const statusText = isExceeded ? "Vượt hạn mức!" : isWarning ? "Sắp chạm hạn mức" : "Ổn định";
                                    const statusColor = isExceeded ? "text-[#d93025]" : isWarning ? "text-[#f39c12]" : "text-[#1e8e3e]";
                                    const barColor = isExceeded ? "bg-[#d93025]" : isWarning ? "bg-[#f39c12]" : "bg-[#1e8e3e]";

                                    return (
                                        <div key={budget.id || idx}>
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <p className="font-bold text-sm text-[#191c1e]">{budget.categoryName}</p>
                                                    <p className="text-[10px] text-[#191c1e]/50 font-bold">
                                                        {addThousandsSeparator(Math.floor(budget.totalSpent))} / {addThousandsSeparator(Math.floor(budget.amountLimit))}
                                                    </p>
                                                </div>
                                                <p className={`text-xs font-bold ${statusColor}`}>{statusText}</p>
                                            </div>
                                            <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                                                <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{width: `${Math.min(ratio, 100)}%`}}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-sm text-[#191c1e]/40 font-medium">Chưa thiết lập ngân sách</p>
                                    <button onClick={() => navigate('/budgets')} className="mt-2 text-xs font-bold text-[#2563eb] hover:underline">Thiết lập ngay</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vidget Mục tiêu ưu tiên */}
                    {dashboardData?.priorityGoal ? (
                        <div className="bg-[#0A1128] rounded-[2rem] p-8 relative overflow-hidden text-white shadow-xl h-full flex flex-col justify-between">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#6100c6] rounded-full blur-[40px] opacity-50"></div>
                            <div>
                                <p className="text-xs text-white/60 font-bold uppercase tracking-widest mb-1">Mục tiêu ưu tiên</p>
                                <div className="flex justify-between items-start mb-8">
                                    <h3 className="text-xl font-bold truncate pr-4">{dashboardData.priorityGoal.name}</h3>
                                    <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold">
                                        {new Date(dashboardData.priorityGoal.targetDate).getFullYear()}
                                    </span>
                                </div>
                                <div className="mb-2 flex items-baseline gap-2">
                                    <span className="text-3xl font-black">{Math.floor(dashboardData.priorityGoal.progressPercent)}%</span>
                                    <span className="text-xs text-white/50">
                                        {addThousandsSeparator(Math.floor(dashboardData.priorityGoal.currentAmount))} VND / {addThousandsSeparator(Math.floor(dashboardData.priorityGoal.targetAmount))} VND
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{width: `${dashboardData.priorityGoal.progressPercent}%`}}></div>
                                </div>
                            </div>
                            <button onClick={() => navigate(`/saving-goals/${dashboardData.priorityGoal.id}`)} className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all mt-auto">
                                Xem lộ trình tiết kiệm
                            </button>
                            <div onClick={() => navigate('/saving-goals')} className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#6100c6] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-[#6100c6]/20">
                                <span className="material-symbols-outlined text-white">add</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#0A1128] rounded-[2rem] p-8 relative overflow-hidden text-white shadow-xl h-full flex flex-col items-center justify-center text-center">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#6100c6] rounded-full blur-[40px] opacity-50"></div>
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl">target</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Chưa có mục tiêu tiết kiệm</h3>
                            <p className="text-xs text-white/60 mb-6">Hãy thiết lập mục tiêu đầu tiên để theo dõi lộ trình tài chính của bạn.</p>
                            <button onClick={() => navigate('/saving-goals')} className="px-6 py-2 rounded-full bg-white text-[#0A1128] text-sm font-bold hover:bg-white/90 transition-all">
                                Tạo mục tiêu ngay
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </Dashboard>
    );
};

export default Home;
