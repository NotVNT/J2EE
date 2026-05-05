import { useEffect, useState } from "react";
import { prepareIncomeLineChartData } from "../util/util.js";
import CustomLineChart from "./CustomLineChart.jsx";
import { Plus } from "lucide-react";

const IncomeOverview = ({ transactions, onAddIncome }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareIncomeLineChartData(transactions);
    setChartData(result);
  }, [transactions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h5 className="text-base font-bold text-slate-900 dark:text-white">Tổng quan thu nhập</h5>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Theo dõi và phân tích xu hướng thu nhập của bạn.</p>
        </div>
        <button className="add-btn" onClick={onAddIncome}>
          <Plus size={15} />Thêm thu nhập
        </button>
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

export default IncomeOverview;
