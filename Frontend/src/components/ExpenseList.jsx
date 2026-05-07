import moment from "moment";
import {Download, LoaderCircle, Mail} from "lucide-react";
import {useState} from "react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";

const cardBtnBase = "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors";

const ExpenseList = ({
    transactions,
    onDelete,
    onDownload,
    onEmail,
    disableExportActions = false,
    disabledMessage = "",
}) => {
    const [loadingAction, setLoadingAction] = useState(null);
    const isBusy = loadingAction !== null;

    const handleAction = async (action, callback) => {
        if (disableExportActions || !callback) return;
        setLoadingAction(action);
        try {
            await callback();
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold text-slate-900 dark:text-white">Tất cả chi tiêu</h5>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            className={`${cardBtnBase} ${isBusy || disableExportActions ? "cursor-not-allowed opacity-60" : ""}`}
                            disabled={isBusy || disableExportActions}
                            onClick={() => handleAction("email", onEmail)}
                            title={disableExportActions ? disabledMessage : ""}
                            type="button"
                        >
                            {loadingAction === "email" ? (
                                <><LoaderCircle className="w-4 h-4 animate-spin"/>Đang gửi...</>
                            ) : (
                                <><Mail size={15} />Gửi Email</>
                            )}
                        </button>
                        <button
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-transparent bg-violet-600 hover:bg-violet-500 text-white transition-colors ${isBusy || disableExportActions ? "cursor-not-allowed opacity-60" : ""}`}
                            disabled={isBusy || disableExportActions}
                            onClick={() => handleAction("download", onDownload)}
                            title={disableExportActions ? disabledMessage : ""}
                            type="button"
                        >
                            {loadingAction === "download" ? (
                                <><LoaderCircle className="w-4 h-4 animate-spin"/>Đang tạo AWS...</>
                            ) : (
                                <><Download size={15} />Tải File Excel </>
                            )}
                        </button>
                    </div>
                    {disableExportActions && disabledMessage ? (
                        <p className="max-w-xs text-right text-xs text-amber-600 dark:text-amber-400">{disabledMessage}</p>
                    ) : null}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                {transactions?.map((expense) => (
                    <TransactionInfoCard
                        key={expense.id}
                        title={expense.name}
                        icon={expense.icon}
                        category={expense.categoryName}
                        receiptLocation={expense.receiptLocation}
                        date={moment(expense.date).format('DD/MM/YYYY')}
                        amount={expense.amount}
                        type="expense"
                        onDelete={() => onDelete(expense.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ExpenseList;
