import {hasDisplayImage, hideBrokenImageWrapper} from "../util/imageDisplay.js";

/**
 * BudgetCard – Hiển thị 1 hạn mức ngân sách với thanh tiến trình
 * Props:
 *   budget      – { id, categoryName, categoryIcon, amountLimit, totalSpent, month, year }
 *   onDelete    – callback(id) khi bấm xóa
 */
const BudgetCard = ({ budget, onDelete }) => {
    const {
        id,
        categoryName,
        categoryIcon,
        amountLimit,
        totalSpent,
        month,
        year,
    } = budget;

    const ratio = amountLimit > 0 ? totalSpent / amountLimit : 0;
    const percentage = Math.min(ratio * 100, 100).toFixed(1);

    // Xác định màu sắc theo trạng thái
    const isExceeded = ratio >= 1;
    const isWarning  = !isExceeded && ratio >= 0.8;
    const barColor   = isExceeded ? "#e74c3c" : isWarning ? "#f39c12" : "#2ecc71";
    const statusText = isExceeded
        ? "🚨 Vượt hạn mức"
        : isWarning
        ? "⚠️ Sắp hết hạn mức"
        : "✅ Trong giới hạn";

    const fmt = (n) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(n);

    return (
        <div className={`budget-card ${isExceeded ? "budget-card--danger" : isWarning ? "budget-card--warning" : ""}`}>
            <div className="budget-card__header">
                <div className="budget-card__category">
                    {hasDisplayImage(categoryIcon) ? (
                        <span data-image-wrapper="true" className="budget-card__icon">
                            <img
                                src={categoryIcon}
                                alt={categoryName}
                                className="h-5 w-5 object-contain"
                                onError={hideBrokenImageWrapper}
                            />
                        </span>
                    ) : null}
                    <div>
                        <p className="budget-card__name">{categoryName}</p>
                        <p className="budget-card__period">
                            Tháng {month}/{year}
                        </p>
                    </div>
                </div>
                <button
                    className="budget-card__delete"
                    onClick={() => onDelete(id)}
                    id={`budget-delete-${id}`}
                    title="Xóa hạn mức"
                >
                    ✕
                </button>
            </div>

            {/* Thanh tiến trình */}
            <div className="budget-card__bar-wrap">
                <div
                    className="budget-card__bar"
                    style={{ width: `${percentage}%`, background: barColor }}
                />
            </div>

            <div className="budget-card__stats">
                <div>
                    <p className="budget-card__label">Đã chi</p>
                    <p className="budget-card__value">{fmt(totalSpent)}</p>
                </div>
                <div className="budget-card__status-badge" style={{ color: barColor }}>
                    {statusText}
                </div>
                <div className="budget-card__right">
                    <p className="budget-card__label">Hạn mức</p>
                    <p className="budget-card__value">{fmt(amountLimit)}</p>
                </div>
            </div>

            <p className="budget-card__percentage" style={{ color: barColor }}>
                {percentage}% sử dụng
            </p>
        </div>
    );
};

export default BudgetCard;
