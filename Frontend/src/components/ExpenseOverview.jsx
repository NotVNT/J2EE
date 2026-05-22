import { useEffect, useState } from "react";
import { CircleHelp, ImageUp, LoaderCircle, Plus } from "lucide-react";
import CustomLineChart from "./CustomLineChart.jsx";
import { prepareIncomeLineChartData } from "../util/util.js";

const ExpenseOverview = ({ transactions, onExpenseIncome, onImportReceipt, isImportingReceipt = false, onOpenFormatInfo }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareIncomeLineChartData(transactions);
    setChartData(result);
  }, [transactions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h5 className="text-base font-bold text-slate-900 dark:text-white">Tổng quan chi tiêu</h5>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Theo dõi chi tiêu và xem chi tiết tiền của bạn đi đâu.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              className="add-btn disabled:opacity-60 disabled:cursor-not-allowed bg-slate-700 hover:bg-slate-600"
              onClick={onImportReceipt}
              disabled={!onImportReceipt || isImportingReceipt}
              type="button"
            >
              {isImportingReceipt ? (
                <><LoaderCircle size={15} className="animate-spin" />Đang quét hóa đơn...</>
              ) : (
                <><ImageUp size={15} />Kiểm tra hóa đơn</>
              )}
            </button>
            {onOpenFormatInfo && (
              <button
                type="button"
                onClick={onOpenFormatInfo}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Xem định dạng hỗ trợ"
              >
                <CircleHelp size={16} />
              </button>
            )}
          </div>
          <button className="add-btn" onClick={onExpenseIncome}>
            <Plus size={15} />Thêm chi tiêu
          </button>
        </div>
      </div>
      <div className="mt-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center p-10 text-sm text-slate-400 dark:text-slate-500
            bg-slate-50 dark:bg-white/3 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
            Chưa có dữ liệu cho khoảng thời gian này
          </div>
        ) : (
          <CustomLineChart data={chartData} />
        )}
      </div>
    </div>
  );
};

export default ExpenseOverview;
