import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";
import InfoCard from "../components/InfoCard.jsx";
import { Coins, PiggyBank, Target, Wallet, WalletCards, Sparkles, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, DollarSign, Calendar, PieChart } from "lucide-react";
import { addThousandsSeparator } from "../util/util.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

    // Helper để lấy token theo cách của axiosConfig
    const getToken = () => {
        return localStorage.getItem("token") || sessionStorage.getItem("token");
    };

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
                console.log("Detailed insight response:", response.data); // Debug

                if (response.data.error) {
                    console.error("Detailed insight error:", response.data.error);
                    toast.error(response.data.message || "Không thể tải phân tích chi tiết");
                    setDetailedInsight(null);
                } else if (response.data.status === "insufficient_data") {
                    toast.custom((t) => (
                        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-lg max-w-md">
                            <p className="font-semibold">⚠️ Chưa đủ dữ liệu</p>
                            <p className="text-sm mt-1">{response.data.message || "Hãy thêm nhiều giao dịch hơn để AI có thể phân tích chi tiết!"}</p>
                        </div>
                    ));
                    setDetailedInsight(null);
                } else {
                    setDetailedInsight(response.data);
                }
            }
        } catch (error) {
            console.error("Something went wrong while fetching detailed insight:", error);

            if (error.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                setDetailedInsight(null);
            } else if (error.response?.status === 403) {
                toast.error("Bạn không có quyền truy cập tính năng này!");
                setDetailedInsight(null);
            } else if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || "Dữ liệu không hợp lệ. Vui lòng thử lại!";
                toast.error(errorMessage);
                setDetailedInsight(null);
            } else if (error.response?.status === 500) {
                toast.error("Lỗi máy chủ. Vui lòng thử lại sau!");
                setDetailedInsight(null);
            } else if (error.code === 'ERR_NETWORK') {
                toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend!");
                setDetailedInsight(null);
            } else {
                toast.error("Không thể tải phân tích chi tiết!");
                setDetailedInsight(null);
            }
        } finally {
            setDetailedLoading(false);
        }
    };

    const toggleDetailedInsight = () => {
        if (!showDetailedInsight && !detailedInsight && !detailedLoading) {
            fetchDetailedInsight();
        }
        setShowDetailedInsight(!showDetailedInsight);
    };

    useEffect(() => {
        const token = getToken();
        if (!token) {
            console.warn("No token found, user may need to login");
            setAiInsight("Vui lòng đăng nhập để sử dụng tính năng AI!");
        } else {
            fetchDashboardData();
            fetchAiInsight();
        }
    }, []);

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "0 VND";
        const num = typeof amount === 'object' ? 0 : Number(amount);
        if (isNaN(num)) return "0 VND";
        return addThousandsSeparator(Math.floor(num)) + " VND";
    };

    // Get risk level color
    const getRiskColor = (riskLevel) => {
        switch (riskLevel) {
            case "CAO": return "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30";
            case "TRUNG_BÌNH": return "text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30";
            default: return "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30";
        }
    };

    // Helper để kiểm tra và hiển thị số liệu an toàn
    const safeNumber = (value) => {
        if (!value && value !== 0) return 0;
        return value;
    };

    return (
        <Dashboard activeMenu="Dashboard">
            <div className="my-5 mx-auto">
                {/* AI Insight - Có thể xổ xuống */}
                <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>

                    {/* Header - Luôn hiển thị */}
                    <div
                        className="p-6 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={toggleDetailedInsight}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <Sparkles className={`w-6 h-6 ${aiLoading ? "animate-spin text-yellow-300" : "text-yellow-400"}`} />
                                <h3 className="font-bold text-xl tracking-wide text-white">Trợ lý AI Tiên Tri</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white/80">
                                    {showDetailedInsight ? "Thu gọn" : "Xem phân tích chi tiết"}
                                </span>
                                {showDetailedInsight ?
                                    <ChevronUp className="w-5 h-5 text-white" /> :
                                    <ChevronDown className="w-5 h-5 text-white" />
                                }
                            </div>
                        </div>

                        {/* Nội dung tóm tắt - Luôn hiển thị */}
                        <div className="relative z-10 min-h-[40px] flex items-center mt-2">
                            {aiLoading ? (
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                    <span className="animate-pulse text-white/90 text-lg">
                                        Đang phân tích thói quen chi tiêu của bạn...
                                    </span>
                                </div>
                            ) : (
                                <p className="text-lg font-medium leading-relaxed drop-shadow-sm text-white">
                                    {aiInsight || "Hãy thêm vài giao dịch mới để AI có thể đưa ra dự đoán cho bạn nhé!"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Nội dung chi tiết - Xổ xuống */}
                    {showDetailedInsight && (
                        <div className="border-t border-white/20 p-6 relative z-10 bg-black/20">
                            {detailedLoading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin mb-4"></div>
                                    <p className="text-white/80">Đang phân tích dữ liệu và dự đoán tương lai...</p>
                                </div>
                            ) : detailedInsight ? (
                                <div className="space-y-6">
                                    {/* Dự đoán rủi ro */}
                                    {detailedInsight.forecast && (
                                        <div className="bg-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle className="w-5 h-5 text-yellow-300" />
                                                <h4 className="font-bold text-white">Dự đoán rủi ro</h4>
                                            </div>
                                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getRiskColor(detailedInsight.forecast.riskLevel)}`}>
                                                Mức độ rủi ro: {detailedInsight.forecast.riskLevel === "CAO" ? "Cao" : detailedInsight.forecast.riskLevel === "TRUNG_BÌNH" ? "Trung bình" : "Thấp"}
                                            </div>
                                            <p className="text-white/90">{detailedInsight.forecast.riskMessage || "Đang phân tích..."}</p>
                                            {detailedInsight.forecast.runOutDate && (
                                                <p className="text-red-300 mt-2 font-semibold">
                                                    ⚠️ Dự đoán bạn sẽ hết tiền vào ngày {detailedInsight.forecast.runOutDate}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Dự báo tháng tới */}
                                    {detailedInsight.forecast && (
                                        <div className="bg-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TrendingUp className="w-5 h-5 text-green-300" />
                                                <h4 className="font-bold text-white">Dự báo tháng tới</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-white/70 text-sm">Chi tiêu dự kiến</p>
                                                    <p className="text-white font-semibold">
                                                        {formatCurrency(detailedInsight.forecast.predictedNextMonthExpense)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-sm">Thu nhập dự kiến</p>
                                                    <p className="text-white font-semibold">
                                                        {formatCurrency(detailedInsight.forecast.predictedNextMonthIncome)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-white/20">
                                                <p className="text-white/70 text-sm">Dòng tiền ròng</p>
                                                <p className={`font-semibold ${(detailedInsight.forecast.predictedNextMonthNetCashFlow || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                    {formatCurrency(detailedInsight.forecast.predictedNextMonthNetCashFlow)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Phân tích danh mục chi tiêu */}
                                    {detailedInsight.categoryAnalysis && detailedInsight.categoryAnalysis.length > 0 && (
                                        <div className="bg-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <PieChart className="w-5 h-5 text-blue-300" />
                                                <h4 className="font-bold text-white">Top danh mục chi tiêu</h4>
                                            </div>
                                            <div className="space-y-2">
                                                {detailedInsight.categoryAnalysis.map((cat, idx) => (
                                                    <div key={idx} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{cat.icon || "📌"}</span>
                                                            <span className="text-white">{cat.category}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-white font-semibold">{formatCurrency(cat.amount)}</p>
                                                            <p className="text-white/60 text-sm">{cat.percentage}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Phân tích xu hướng */}
                                    {detailedInsight.trendAnalysis && (
                                        <div className="bg-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TrendingUp className="w-5 h-5 text-purple-300" />
                                                <h4 className="font-bold text-white">Phân tích xu hướng</h4>
                                            </div>
                                            <p className="text-white/90 mb-2">{detailedInsight.trendAnalysis.expenseTrendMessage || "Đang phân tích..."}</p>
                                            <p className="text-white/90">{detailedInsight.trendAnalysis.incomeTrendMessage || "Đang phân tích..."}</p>
                                            <p className="text-white/80 mt-2 text-sm">{detailedInsight.trendAnalysis.description || ""}</p>
                                        </div>
                                    )}

                                    {/* Chỉ số tài chính */}
                                    {detailedInsight.financialRatios && (
                                        <div className="bg-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <DollarSign className="w-5 h-5 text-yellow-300" />
                                                <h4 className="font-bold text-white">Chỉ số tài chính</h4>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <p className="text-white/70 text-sm">Tỷ lệ tiết kiệm</p>
                                                    <p className="text-white font-semibold">
                                                        {detailedInsight.financialRatios.savingsRate || 0}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-white/70 text-sm">Sức khỏe tài chính</p>
                                                    <p className={`font-semibold ${
                                                        detailedInsight.financialRatios.healthScore === "TỐT" ? "text-green-300" :
                                                        detailedInsight.financialRatios.healthScore === "KHÁ" ? "text-blue-300" :
                                                        detailedInsight.financialRatios.healthScore === "TRUNG BÌNH" ? "text-yellow-300" :
                                                        "text-red-300"
                                                    }`}>
                                                        {detailedInsight.financialRatios.healthScore || "CHƯA ĐỦ DỮ LIỆU"}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-white/80 text-sm">{detailedInsight.financialRatios.healthMessage || "Đang phân tích..."}</p>
                                        </div>
                                    )}

                                    {/* Lời khuyên chi tiết */}
                                    {detailedInsight.detailedAdvice && (
                                        <div className="bg-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="w-5 h-5 text-pink-300" />
                                                <h4 className="font-bold text-white">Lời khuyên từ AI</h4>
                                            </div>
                                            <div className="text-white/90 whitespace-pre-line text-sm">
                                                {detailedInsight.detailedAdvice}
                                            </div>
                                        </div>
                                    )}

                                    {/* Thông tin tháng hiện tại */}
                                    {detailedInsight.currentMonth && (
                                        <div className="bg-white/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Calendar className="w-5 h-5 text-orange-300" />
                                                <h4 className="font-bold text-white">Thông tin tháng {detailedInsight.currentMonth.month}</h4>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <p className="text-white/60 text-xs">Ngày hiện tại</p>
                                                    <p className="text-white font-semibold">{detailedInsight.currentMonth.currentDay}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/60 text-xs">Tổng số ngày</p>
                                                    <p className="text-white font-semibold">{detailedInsight.currentMonth.daysInMonth}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/60 text-xs">Ngày còn lại</p>
                                                    <p className="text-white font-semibold">{detailedInsight.currentMonth.daysLeft}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-white/80">
                                        Không thể tải phân tích chi tiết. Vui lòng thử lại sau.
                                    </p>
                                    <button
                                        onClick={fetchDetailedInsight}
                                        className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white text-sm"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tổng quan số liệu */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoCard icon={<WalletCards />} label="Tổng số dư" value={addThousandsSeparator(safeNumber(dashboardData?.totalBalance))} color="bg-purple-800" />
                    <InfoCard icon={<Wallet />} label="Tổng thu nhập" value={addThousandsSeparator(safeNumber(dashboardData?.totalIncome))} color="bg-green-800" />
                    <InfoCard icon={<Coins />} label="Tổng chi tiêu" value={addThousandsSeparator(safeNumber(dashboardData?.totalExpense))} color="bg-red-800" />
                </div>

                {/* Mục tiêu tiết kiệm */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <InfoCard icon={<Target />} label="Mục tiêu đang chạy" value={safeNumber(dashboardData?.savingGoalActiveCount)} color="bg-indigo-700" />
                    <InfoCard icon={<PiggyBank />} label="Đã tích luỹ" value={addThousandsSeparator(safeNumber(dashboardData?.savingGoalTotalSaved))} color="bg-emerald-700" />
                    <InfoCard icon={<Target />} label="Mục tiêu hoàn thành" value={safeNumber(dashboardData?.savingGoalCompletedCount)} color="bg-teal-700" />
                </div>

                {/* Lịch sử giao dịch & Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <RecentTransactions transactions={dashboardData?.recentTransactions || []} onMore={() => navigate("/expense")} />
                    <FinanceOverview
                        totalBalance={safeNumber(dashboardData?.totalBalance)}
                        totalIncome={safeNumber(dashboardData?.totalIncome)}
                        totalExpense={safeNumber(dashboardData?.totalExpense)}
                    />
                    <Transactions
                        transactions={dashboardData?.recent5Expenses || []}
                        onMore={() => navigate("/expense")}
                        type="expense"
                        title="Chi tiêu gần đây"
                    />
                    <Transactions
                        transactions={dashboardData?.recent5Incomes || []}
                        onMore={() => navigate("/income")}
                        type="income"
                        title="Thu nhập gần đây"
                    />
                </div>
            </div>
        </Dashboard>
    );
};

export default Home;