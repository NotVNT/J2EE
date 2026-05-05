import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm">
      <div className="relative p-4 w-full max-w-2xl max-h-[90vh]">
        <div className="relative rounded-2xl shadow-2xl overflow-hidden
          bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer
                text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
                bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 text-slate-700 dark:text-slate-300 overflow-y-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
