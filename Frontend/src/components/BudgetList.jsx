import BudgetCard from "./BudgetCard.jsx";

/**
 * BudgetList – Danh sách hạn mức ngân sách
 * Props:
 *   budgets     – mảng budget objects
 *   onDelete    – callback(id)
 *   onAddClick  – callback khi ấn nút Thêm hạn mức mới
 *   loading     – boolean
 */
const BudgetList = ({
  budgets = [],
  onDelete,
  onAddClick,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="budget-list__empty">
        <p>Đang tải hạn mức...</p>
      </div>
    );
  }

  return (
    <div className="budget-list text-slate-900">
      <div className="budget-list__header">
        <div>
          <h2 className="budget-list__title text-slate-900">
            Hạn mức ngân sách
          </h2>
          <p className="budget-list__subtitle">
            Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
          </p>
        </div>
        <button
          className="add-btn add-btn-fill"
          onClick={onAddClick}
          id="budget-add-btn"
        >
          + Thêm hạn mức
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="budget-list__empty">
          <span className="budget-list__empty-icon">💸</span>
          <p>Chưa có hạn mức nào trong tháng này</p>
          <p className="budget-list__empty-hint">
            Nhấn <strong>+ Thêm hạn mức</strong> để bắt đầu quản lý ngân sách
          </p>
        </div>
      ) : (
        <div className="budget-list__grid">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetList;
