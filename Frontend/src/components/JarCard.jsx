import { Pencil, Trash2, TrendingUp, TrendingDown, Vault } from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n ?? 0);

const JarCard = ({ jar, totalBalance, onEdit, onDelete, onClick }) => {
  const { name, icon, color, targetPercentage, currentBalance } = jar;

  const actualPercent = totalBalance > 0
    ? ((currentBalance / totalBalance) * 100).toFixed(1)
    : "0.0";

  const isOverTarget = parseFloat(actualPercent) > (targetPercentage ?? 0);
  const isNegative = currentBalance < 0;

  const progressWidth = Math.min(
    Math.abs(currentBalance) / (totalBalance > 0 ? totalBalance : 1) * 100,
    100
  );

  return (
    <div className="card relative overflow-hidden group hover:shadow-lg transition-[transform,box-shadow] duration-300 cursor-pointer transform-gpu hover:scale-[1.01] active:scale-[0.99]" onClick={onClick}>
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: color || "#8B5CF6" }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mt-1 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: `${color || "#8B5CF6"}20` }}
          >
            {icon ? (
              <img src={icon} alt={name} className="w-6 h-6" />
            ) : (
              <Vault size={20} style={{ color: color || "#8B5CF6" }} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white truncate">{name}</h3>
            <p className="text-xs text-slate-400">
              Mục tiêu: {targetPercentage ?? 0}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Xoá hũ"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-3">
        <p className={`text-2xl font-bold ${isNegative ? "text-red-500" : "text-slate-800 dark:text-white"}`}>
          {fmt(currentBalance)}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Tỷ trọng thực tế</span>
          <span className="font-medium" style={{ color: color || "#8B5CF6" }}>
            {actualPercent}% / {targetPercentage ?? 0}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${progressWidth}%`,
              backgroundColor: isNegative ? "#EF4444" : (color || "#8B5CF6"),
            }}
          />
        </div>
      </div>

      {/* Status tag */}
      <div className="flex items-center gap-1.5">
        {parseFloat(actualPercent) >= (targetPercentage ?? 0) ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            <TrendingUp size={12} /> Đạt mục tiêu
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <TrendingDown size={12} /> Dưới mục tiêu
          </span>
        )}
      </div>
    </div>
  );
};

export default JarCard;
