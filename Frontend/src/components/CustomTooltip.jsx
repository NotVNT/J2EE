import { addThousandsSeparator } from "../util/util.js";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-3 py-2.5 shadow-xl border
        bg-white dark:bg-[#1E293B] border-slate-200 dark:border-white/10">
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">{payload[0].name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Số tiền:{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {addThousandsSeparator(payload[0].value)} VND
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
