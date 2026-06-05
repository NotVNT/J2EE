import { Activity } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../context/ThemeContext.jsx";

const formatCurrency = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

const ForecastTrendChart = ({ data = [], title = "Xu hướng danh mục", isLoading = false, formatYAxis }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tickColor = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)";
  const tooltipBg = isDark ? "#0B0F19" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const tooltipColor = isDark ? "#ffffff" : "#1e293b";

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F19] p-4 sm:p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <Activity size={19} className="text-emerald-500" />
          {title}
        </h3>
        <div className="flex gap-4 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Lịch sử
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Dự báo
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[260px] animate-pulse rounded-2xl border border-slate-200/60 bg-slate-100/50 dark:border-white/5 dark:bg-white/[0.03]" />
      ) : data.length > 0 ? (
        <div className="h-[260px] w-full">
          <ResponsiveContainer key={theme} width="100%" height="100%">
            <LineChart data={data} margin={{ top: 15, right: 20, left: 12, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatYAxis} tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: "14px",
                  color: tooltipColor,
                  fontSize: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value, name) => [formatCurrency(value), name === "actual" ? "Lịch sử" : "Dự báo"]}
              />
              <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} />
              <Line type="monotone" dataKey="predicted" stroke="#F59E0B" strokeWidth={3} strokeDasharray="6 5" dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-400 dark:border-white/10 dark:text-slate-500">
          Chưa có đủ dữ liệu lịch sử cho danh mục này.
        </div>
      )}
    </div>
  );
};

export default ForecastTrendChart;
