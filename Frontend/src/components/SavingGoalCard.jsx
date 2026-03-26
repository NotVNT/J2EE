import {
    Pencil,
    Trash2,
    HandCoins,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    XCircle,
    Gift,
} from "lucide-react";

const fmt = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const SavingGoalCard = ({ goal, onEdit, onDelete, onContribute, onClaimReward }) => {
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
        completedAt,
        status,
        eligibleForEarlyReward,
        rewardClaimed,
        rewardSpent,
        savingFundBalance,
    } = goal;

    const isCompleted = status === "COMPLETED";
    const isCancelled = status === "CANCELLED";
    const isActive = status === "ACTIVE";

    // Progress bar color
    const progressColor = isCompleted
        ? "#10b981"
        : isCancelled
        ? "#9ca3af"
        : progressPercent >= 75
        ? "#10b981"
        : progressPercent >= 40
        ? "#f59e0b"
        : "#6366f1";

    // Monthly progress color
    const monthlyColor =
        monthlyProgressPercent >= 100
            ? "#10b981"
            : monthlyProgressPercent >= 50
            ? "#f59e0b"
            : "#ef4444";

    const statusBadge = isCompleted ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 size={12} /> Hoàn thành
        </span>
    ) : isCancelled ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            <XCircle size={12} /> Đã huỷ
        </span>
    ) : isBehindSchedule ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
            <TrendingDown size={12} /> Chậm tiến độ
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
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
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(startDate)} → {formatDate(targetDate)}
                    </p>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {statusBadge}
                </div>
            </div>

            {/* Main progress */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Tiến độ tổng</span>
                    <span className="font-semibold" style={{ color: progressColor }}>
                        {progressPercent?.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(progressPercent, 100)}%`,
                            background: `linear-gradient(90deg, ${progressColor}cc, ${progressColor})`,
                        }}
                    />
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Mục tiêu</p>
                    <p className="text-sm font-semibold text-gray-800">{fmt(targetAmount)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Đã có</p>
                    <p className="text-sm font-semibold text-green-600">{fmt(currentAmount)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Còn thiếu</p>
                    <p className="text-sm font-semibold text-red-500">{fmt(remainingAmount)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Cần/tháng</p>
                    <p className="text-sm font-semibold text-indigo-600">{fmt(monthlyTarget)}</p>
                </div>
            </div>

            {/* Monthly progress */}
            {isActive && (
                <div className="mb-4 bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Tiến độ tháng này</span>
                        <span className="font-semibold" style={{ color: monthlyColor }}>
                            {fmt(monthlyContributed)} / {fmt(monthlyTarget)} ({monthlyProgressPercent?.toFixed(0)}%)
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(monthlyProgressPercent, 100)}%`,
                                background: monthlyColor,
                            }}
                        />
                    </div>
                </div>
            )}

            {isCompleted && (
                <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Hoàn thành ngày</span>
                        <span className="font-semibold text-emerald-700">{formatDate(completedAt)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Quỹ còn lại</span>
                        <span className="font-semibold text-emerald-700">{fmt(savingFundBalance ?? currentAmount)}</span>
                    </div>
                    {rewardClaimed && (
                        <div className="mt-1 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Đã tự thưởng</span>
                            <span className="font-semibold text-indigo-700">{fmt(rewardSpent ?? 0)}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            {isActive && (
                <div className="flex gap-2">
                    <button
                        onClick={onContribute}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                        <HandCoins size={16} /> Đóng góp
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Chỉnh sửa"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Huỷ mục tiêu"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            {isCompleted && eligibleForEarlyReward && (
                <button
                    onClick={onClaimReward}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Gift size={16} /> Tự thưởng thẻ game/card điện thoại
                </button>
            )}

            {isCompleted && rewardClaimed && (
                <div className="text-center rounded-xl bg-indigo-50 text-indigo-700 text-xs py-2 font-medium">
                    Bạn đã nhận thưởng cho mục tiêu này
                </div>
            )}
        </div>
    );
};

export default SavingGoalCard;
