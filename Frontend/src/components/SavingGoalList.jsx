import { CircleHelp, PiggyBank, Plus, Target, WalletCards } from "lucide-react";
import SavingGoalCard from "./SavingGoalCard.jsx";

const quickTips = [
  {
    icon: Target,
    title: "Tạo mục tiêu rõ ràng",
    description:
      "Nhập số tiền cần đạt và hạn chót để hệ thống tự tính tiến độ cho bạn.",
  },
  {
    icon: WalletCards,
    title: "Đóng góp đều đặn",
    description: 'Bấm "Đóng góp" mỗi lần bạn bỏ thêm tiền vào quỹ tiết kiệm.',
  },
  {
    icon: PiggyBank,
    title: "Theo dõi mức cần/tháng",
    description:
      "Nhìn vào chỉ số này để biết mỗi tháng bạn nên để dành bao nhiêu.",
  },
];

const SavingGoalList = ({
  goals,
  loading,
  onAddClick,
  onEdit,
  onDelete,
  onContribute,
}) => {
  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-white/10 px-5 py-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                Kế hoạch tích lũy
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                Mục tiêu tiết kiệm
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Theo dõi từng mục tiêu, biết còn thiếu bao nhiêu và giữ nhịp
                đóng góp ổn định mỗi tháng.
              </p>
            </div>

            <button
              onClick={onAddClick}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Plus size={15} />
              Thêm mục tiêu
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-10 text-center text-gray-400">Đang tải...</div>
        )}

        {!loading && goals.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white/80 py-16 text-gray-400 shadow-sm">
            <p className="mb-2 text-lg">Chưa có mục tiêu tiết kiệm nào</p>
            <p className="text-sm">
              Bấm "Thêm mục tiêu" để bắt đầu lập kế hoạch!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

      <aside className="rounded-[28px] border bg-gradient-to-br from-white via-indigo-50/5 to-sky-30 p-4 shadow-sm xl:sticky xl:top-5">
        <div className="flex items-center gap-2 text-indigo-700">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-indigo-300 text-indigo-700">
            <CircleHelp size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Hướng dẫn nhanh
            </p>
            <p className="text-xs text-slate-900">
              Hiển thị ngay bên góc phải để bạn thao tác thuận mắt hơn.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {quickTips.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/70 bg-white/80 p-3"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default SavingGoalList;
