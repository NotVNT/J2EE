import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { addThousandsSeparator } from "../util/util.js";

const CustomLineChart = ({ data }) => {
  const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const groupedItems = dataPoint.items?.reduce((acc, item) => {
        const { categoryName, amount } = item;
        if (!acc[categoryName]) acc[categoryName] = { categoryName, totalAmount: 0 };
        acc[categoryName].totalAmount += amount;
        return acc;
      }, {});
      const categories = Object.values(groupedItems || {});

      return (
        <div className="rounded-xl px-3 py-2.5 shadow-xl border text-sm
          bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
          <p className="font-semibold text-slate-800 dark:text-white mb-1">{label}</p>
          <p className="text-slate-500 dark:text-slate-400 mb-1.5">
            Tổng:{" "}
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {addThousandsSeparator(dataPoint.totalAmount)} VND
            </span>
          </p>
          {categories.length > 0 && (
            <div className="border-t border-slate-100 dark:border-white/10 pt-1.5 space-y-0.5">
              {categories.map((c, i) => (
                <div key={i} className="flex justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>{c.categoryName}:</span>
                  <span className="font-medium">{addThousandsSeparator(c.totalAmount)} VND</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94A3B8" }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="totalAmount"
          stroke="#F59E0B"
          fill="url(#areaGradient)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#F59E0B", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#F59E0B" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;
