import { Plus } from "lucide-react";
import SavingGoalCard from "./SavingGoalCard.jsx";

const SavingGoalList = ({ goals, loading, onAddClick, onEdit, onDelete, onContribute }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold">Mục tiêu tiết kiệm</h2>
                <button onClick={onAddClick} className="add-btn flex items-center gap-1">
                    <Plus size={15} />Thêm mục tiêu
                </button>
            </div>

            {loading && (
                <div className="text-center text-gray-400 py-10">Đang tải...</div>
            )}

            {!loading && goals.length === 0 && (
                <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
                    <p className="text-lg mb-2">Chưa có mục tiêu tiết kiệm nào</p>
                    <p className="text-sm">Bấm "Thêm mục tiêu" để bắt đầu lập kế hoạch!</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {goals.map((goal) => (
                    <SavingGoalCard
                        key={goal.id}
                        goal={goal}
                        onEdit={() => onEdit(goal)}
                        onDelete={() => onDelete(goal.id)}
                        onContribute={() => onContribute(goal)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SavingGoalList;
