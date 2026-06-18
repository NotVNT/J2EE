import { Pencil, Trash2, HandCoins, TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react";

const fmt = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const SavingGoalCard = ({ goal, onEdit, onDelete, onContribute }) => {
    const {
        name,
        targetAmount,
        currentAmount,
        remainingAmount,
        progressPercent,
        monthlyTarget,
        monthlyContributed,
        monthlyProgressPercent,
        isBehindSchedule,
        startDate,
        targetDate,
        status,
    } = goal;

    const isCompleted = status === "COMPLETED";
    const isCancelled = status === "CANCELLED";
    const isActive = status === "ACTIVE";

    const progressColor = isCompleted
        ? "#10b981"
        : isCancelled
        ? "#9ca3af"
        : progressPercent >= 75
        ? "#10b981"
        : progressPercent >= 40
        ? "#f59e0b"
        : "#8B5CF6";

    const monthlyColor =
        monthlyProgressPercent >= 100
            ? "#10b981"
            : monthlyProgressPercent >= 50
            ? "#f59e0b"
            : "#EF4444";

    const statusBadge = isCompleted ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={12} /> Hoàn thành
        </span>
    ) : isCancelled ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
            <XCircle size={12} /> Đã huỷ
        </span>
    ) : isBehindSchedule ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400">
            <TrendingDown size={12} /> Chậm tiến độ
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <TrendingUp size={12} /> Đang thực hiện
        </span>
    );

    const formatDate = (d) => {
        if (!d) return "";
        const date = new Date(d);
        return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    };

    return (
        <div className="card relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white truncate">{name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(startDate)} → {formatDate(targetDate)}
                    </p>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                    {statusBadge}
                </div>
            </div>

            {/* Main progress */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500 dark:text-slate-400">Tiến độ tổng</span>
                    <span className="font-semibold" style={{ color: progressColor }}>
                        {progressPercent?.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{
                            width: `${Math.min(progressPercent, 100)}%`,
                            background: `linear-gradient(90deg, ${progressColor}cc, ${progressColor})`,
                        }}
                    />
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Mục tiêu</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{fmt(targetAmount)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Đã tích luỹ</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmt(currentAmount)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Còn thiếu</p>
                    <p className="text-sm font-semibold text-red-500 dark:text-red-400">{fmt(remainingAmount)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-400">Cần/tháng</p>
                    <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">{fmt(monthlyTarget)}</p>
                </div>
            </div>

            {/* Monthly progress */}
            {isActive && (
                <div className="mb-4 bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Tiến độ tháng này</span>
                        <span className="font-semibold" style={{ color: monthlyColor }}>
                            {fmt(monthlyContributed)} / {fmt(monthlyTarget)} ({monthlyProgressPercent?.toFixed(0)}%)
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-[width] duration-500"
                            style={{
                                width: `${Math.min(monthlyProgressPercent, 100)}%`,
                                background: monthlyColor,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            {isActive && (
                <div className="flex gap-2">
                    <button
                        onClick={onContribute}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                        <HandCoins size={16} /> Đóng góp
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-colors"
                        title="Sửa mục tiêu"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Huỷ mục tiêu"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SavingGoalCard;
