import CustomPieChart from "./CustomPieChart.jsx";
import { addThousandsSeparator } from "../util/util.js";

const COLORS = ["#F59E0B", "#8B5CF6", "#10B981", "#3B82F6"];

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
  const balanceData = [
    { name: "Tiết kiệm", amount: totalBalance * 0.45 },
    { name: "Đầu tư", amount: totalBalance * 0.30 },
    { name: "Tiền mặt", amount: totalBalance * 0.15 },
    { name: "Dự phòng", amount: totalBalance * 0.10 },
  ];

  const formatCurrencyStr = (num) => addThousandsSeparator(Math.floor(num));

  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col h-full">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Cơ cấu tài chính</h3>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="w-full flex items-center justify-center" style={{ minHeight: 200 }}>
          <CustomPieChart
            data={balanceData}
            label="Tổng"
            totalAmount={`${formatCurrencyStr(totalBalance)}`}
            colors={COLORS}
            showTextAnchor
            small
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
        {balanceData.map((item, index) => {
          const total = Math.max(1, balanceData.reduce((s, d) => s + d.amount, 0));
          const percent = Math.round((item.amount / total) * 100);
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{percent}%</span>
            </div>
          );
        })}
      </div>

      {/* Income / Expense summary */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Thu nhập</p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 truncate">{formatCurrencyStr(totalIncome)}</p>
        </div>
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">Chi tiêu</p>
          <p className="text-sm font-bold text-red-700 dark:text-red-300 truncate">{formatCurrencyStr(totalExpense)}</p>
        </div>
      </div>
    </div>
  );
};

export default FinanceOverview;
