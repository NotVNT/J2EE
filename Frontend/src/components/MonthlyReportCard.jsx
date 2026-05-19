import { useMemo, useState, useContext } from "react";
import InfoCard from "./InfoCard";
import CustomPieChart from "./CustomPieChart";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import { AppContext } from "../context/AppContext.jsx";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Award,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Flame,
  ShieldCheck,
  ChartBar,
  Brain,
  Sparkles,
  Loader2,
  Lock,
  RefreshCw
} from "lucide-react";

const GRADE_COLORS = {
  A: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500" },
  B: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500" },
  C: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500" },
  D: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500" },
  F: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", border: "border-red-500" },
};

const formatCurrency = (value) => {
  if (!value) return "0";
  return new Intl.NumberFormat("vi-VN").format(value) + " VNĐ";
};

const MonthlyReportCard = ({ report }) => {
  const { user } = useContext(AppContext);
  const isPremium = user?.subscriptionPlan === "PREMIUM";
  const gradeColor = GRADE_COLORS[report.grade] || GRADE_COLORS.F;

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiAnalysis(null);

    const categoryTop = report.categoryBreakdown?.slice(0, 3)
      .map((c) => `${c.name}: ${c.percent?.toFixed(1)}%`)
      .join(", ") || "Không có dữ liệu";

    const spendingTrend =
      report.spendingChangePercent > 0
        ? `tăng ${report.spendingChangePercent.toFixed(1)}%`
        : report.spendingChangePercent < 0
        ? `giảm ${Math.abs(report.spendingChangePercent).toFixed(1)}%`
        : "không đổi";

    const prompt =
      `Phân tích hành vi tài chính tháng ${report.monthName} của tôi (trả lời chi tiết, khoảng 300-400 từ, dùng bullet points ngắn gọn):\n` +
      `- Xếp loại: ${report.grade} (${report.gradeLabel})\n` +
      `- Thu nhập: ${formatCurrency(report.totalIncome)}\n` +
      `- Chi tiêu: ${formatCurrency(report.totalExpense)}\n` +
      `- Tiết kiệm: ${formatCurrency(report.savings)} (tỷ lệ ${report.savingsRate.toFixed(1)}%)\n` +
      `- Chi tiêu so tháng trước: ${spendingTrend}\n` +
      `- Danh mục chi nhiều nhất: ${categoryTop}\n` +
      `- Điểm mạnh: ${report.strengths?.join("; ") || "Không có"}\n` +
      `- Cần cải thiện: ${report.improvements?.join("; ") || "Không có"}\n\n` +
      `Hãy: (1) nhận diện pattern hành vi chi tiêu, (2) chỉ ra thói quen tốt/xấu, (3) đưa ra 3-4 lời khuyên cụ thể và thực tế.`;

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.AI_CHAT, {
        provider: "ninerouter",
        messages: [{ role: "user", content: prompt }],
      });
      setAiAnalysis(response.data?.reply || "Không thể tạo phân tích.");
    } catch (err) {
      setAnalysisError(
        err.response?.data?.message || "Không thể kết nối AI. Vui lòng thử lại."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const spendingChangeInfo = useMemo(() => {
    if (report.spendingChangePercent === 0) return { icon: Minus, color: "text-slate-500", text: "Không đổi" };
    if (report.spendingChangePercent < 0) return { icon: ArrowDown, color: "text-emerald-500", text: `Giảm ${Math.abs(report.spendingChangePercent).toFixed(1)}%` };
    return { icon: ArrowUp, color: "text-red-500", text: `Tăng ${report.spendingChangePercent.toFixed(1)}%` };
  }, [report.spendingChangePercent]);

  const SpendingChangeIcon = spendingChangeInfo.icon;

  // Transform category data for pie chart
  const pieData = useMemo(() => {
    if (!report.categoryBreakdown || report.categoryBreakdown.length === 0) return [];
    return report.categoryBreakdown.map((item) => ({
      name: item.name,
      amount: item.amount,
      percent: item.percent,
      color: item.color || "#94A3B8",
      icon: item.icon || "📦",
    }));
  }, [report.categoryBreakdown]);

  // Extract colors from pieData for CustomPieChart
  const PIE_FALLBACK_COLORS = ["#F59E0B", "#8B5CF6", "#10B981", "#3B82F6", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"];
  const pieColors = pieData.length > 0
    ? pieData.map((item, i) => item.color || PIE_FALLBACK_COLORS[i % PIE_FALLBACK_COLORS.length])
    : PIE_FALLBACK_COLORS;

  return (
    <div className="space-y-6">
      {/* Grade Badge */}
      <div className={`relative overflow-hidden p-8 rounded-2xl border-2 ${gradeColor.border} ${gradeColor.bg} text-center`}>
        <div className="text-8xl font-black tracking-tighter mb-2 ${gradeColor.text}">
          <span className={gradeColor.text}>{report.grade}</span>
        </div>
        <p className={`text-xl font-bold ${gradeColor.text}`}>{report.gradeLabel}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bảng điểm tháng {report.monthName}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          icon={<TrendingUp size={22} />}
          label="Tổng thu nhập"
          value={formatCurrency(report.totalIncome)}
          color="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        />
        <InfoCard
          icon={<TrendingDown size={22} />}
          label="Tổng chi tiêu"
          value={formatCurrency(report.totalExpense)}
          color="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
        />
        <InfoCard
          icon={<PiggyBank size={22} />}
          label="Tiết kiệm"
          value={formatCurrency(report.savings)}
          color="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
        />
        <InfoCard
          icon={<SpendingChangeIcon size={22} />}
          label="So với tháng trước"
          value={spendingChangeInfo.text}
          color="bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* Savings Rate */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Percent size={18} className="text-violet-500" />
            Tỷ lệ tiết kiệm
          </h3>
          <span className={`text-lg font-bold ${gradeColor.text}`}>{report.savingsRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              report.savingsRate >= 30 ? "bg-emerald-500" :
              report.savingsRate >= 20 ? "bg-blue-500" :
              report.savingsRate >= 10 ? "bg-amber-500" :
              report.savingsRate >= 0 ? "bg-orange-500" : "bg-red-500"
            }`}
            style={{ width: `${Math.min(Math.max(report.savingsRate, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      {pieData.length > 0 && (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <ChartBar size={18} className="text-violet-500" />
            Phân bổ chi tiêu theo danh mục
          </h3>
          <CustomPieChart data={pieData} colors={pieColors} />
        </div>
      )}

      {/* Month-over-Month Comparison */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-violet-500" />
          So sánh với tháng trước
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Chỉ tiêu</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Tháng này</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Tháng trước</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Thu nhập</td>
                <td className="py-3 px-4 text-right text-slate-900 dark:text-white">{formatCurrency(report.totalIncome)}</td>
                <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">{formatCurrency(report.prevMonthIncome)}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center gap-1 font-medium ${
                    report.totalIncome >= report.prevMonthIncome ? "text-emerald-500" : "text-red-500"
                  }`}>
                    {report.totalIncome >= report.prevMonthIncome ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {report.prevMonthIncome > 0
                      ? `${((report.totalIncome - report.prevMonthIncome) / report.prevMonthIncome * 100).toFixed(1)}%`
                      : "N/A"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Chi tiêu</td>
                <td className="py-3 px-4 text-right text-slate-900 dark:text-white">{formatCurrency(report.totalExpense)}</td>
                <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">{formatCurrency(report.prevMonthExpense)}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center gap-1 font-medium ${
                    report.totalExpense <= report.prevMonthExpense ? "text-emerald-500" : "text-red-500"
                  }`}>
                    {report.totalExpense <= report.prevMonthExpense ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                    {report.prevMonthExpense > 0
                      ? `${((report.totalExpense - report.prevMonthExpense) / report.prevMonthExpense * 100).toFixed(1)}%`
                      : "N/A"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Tiết kiệm</td>
                <td className="py-3 px-4 text-right text-slate-900 dark:text-white">{formatCurrency(report.savings)}</td>
                <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">{formatCurrency(report.prevMonthSavings)}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center gap-1 font-medium ${
                    report.savings >= report.prevMonthSavings ? "text-emerald-500" : "text-red-500"
                  }`}>
                    {report.savings >= report.prevMonthSavings ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {report.prevMonthSavings > 0
                      ? `${((report.savings - report.prevMonthSavings) / report.prevMonthSavings * 100).toFixed(1)}%`
                      : report.savings > 0 ? "+Mới" : "N/A"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Badges */}
      {report.badges && report.badges.length > 0 && (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Award size={18} className="text-amber-500" />
            Thành tích đạt được
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.badges.map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                  bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Budget & Goal Status */}
      {report.totalBudgets > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-blue-500" />
              Ngân sách
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {report.budgetsOnTrack}/{report.totalBudgets} ngân sách đang trong hạn mức
            </p>
          </div>
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Target size={18} className="text-emerald-500" />
              Mục tiêu tiết kiệm
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {report.completedGoalsThisMonth > 0
                ? `Đã hoàn thành ${report.completedGoalsThisMonth} mục tiêu trong tháng`
                : `Đang theo dõi ${report.totalActiveGoals} mục tiêu`}
            </p>
          </div>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.strengths && report.strengths.length > 0 && (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-3">
              <CheckCircle2 size={18} />
              Điểm mạnh
            </h3>
            <ul className="space-y-2">
              {report.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✅</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {report.improvements && report.improvements.length > 0 && (
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-3">
              <Flame size={18} />
              Cần cải thiện
            </h3>
            <ul className="space-y-2">
              {report.improvements.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-amber-500 mt-0.5 shrink-0">💡</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Behavior Analysis */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-violet-500" />
            Phân tích hành vi tài chính bằng AI
          </h3>
          {!isPremium && (
            <span className="text-[10px] font-semibold text-amber-500 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 rounded-md px-1.5 py-0.5">
              PREMIUM
            </span>
          )}
        </div>

        {!isPremium ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <Lock size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Tính năng phân tích hành vi AI sử dụng model EXPERIMENTAL, chỉ khả dụng cho gói PREMIUM.
            </p>
          </div>
        ) : isAnalyzing ? (
          <div className="flex items-center gap-3 py-4 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 size={18} className="animate-spin text-violet-500" />
            Nova đang phân tích hành vi tài chính của bạn...
          </div>
        ) : aiAnalysis ? (
          <div>
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose-sm max-w-none
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-2
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:my-2
              [&_li]:leading-relaxed
              [&_strong]:font-semibold [&_strong]:text-slate-900 [&_strong]:dark:text-white
              [&_p]:mb-2 [&_p:last-child]:mb-0
              [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:dark:text-slate-100 [&_h3]:mt-3 [&_h3]:mb-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {aiAnalysis}
              </ReactMarkdown>
            </div>
            <button
              onClick={analyzeWithAI}
              className="mt-4 flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
            >
              <RefreshCw size={12} />
              Phân tích lại
            </button>
          </div>
        ) : analysisError ? (
          <div className="space-y-3">
            <p className="text-sm text-red-500 dark:text-red-400">{analysisError}</p>
            <button
              onClick={analyzeWithAI}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
            >
              <RefreshCw size={14} />
              Thử lại
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nova Money sẽ phân tích sâu hành vi tài chính của bạn, nhận diện các pattern chi tiêu và đưa ra lời khuyên cá nhân hóa dựa trên dữ liệu thực tế.
            </p>
            <button
              onClick={analyzeWithAI}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Brain size={16} />
              Phân tích hành vi tài chính
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReportCard;
