import { AlertCircle } from "lucide-react";

const ExperimentalWarningModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Tính Năng Thử Nghiệm
          </h3>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300">
          Bạn đang chọn sử dụng model <strong>EXPERIMENTAL</strong>.
          Đây là tính năng thử nghiệm và có thể:
        </p>

        <ul className="text-sm space-y-1.5 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
            <span>Có trải nghiệm không ổn định</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
            <span>Response chậm hơn bình thường</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
            <span>Có thể gặp lỗi không mong muốn</span>
          </li>
        </ul>

        <p className="text-sm text-slate-700 dark:text-slate-300">
          Bạn vẫn muốn tiếp tục không?
        </p>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm font-medium"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition text-sm font-semibold"
          >
            Tiếp Tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperimentalWarningModal;
