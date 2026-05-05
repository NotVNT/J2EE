import {Download, LoaderCircle, Mail} from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import moment from "moment";
import {useState} from "react";

const cardBtnBase = "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors";

const IncomeList = ({
    transactions,
    onDelete,
    onDownload,
    onEmail,
    disableExportActions = false,
    disabledMessage = "",
}) => {
    const [loadingAction, setLoadingAction] = useState(null);
    const isBusy = loadingAction !== null;

    const handleEmail = async () => {
        if (disableExportActions) return;
        setLoadingAction("email");
        try {
            await onEmail();
        } finally {
            setLoadingAction(null);
        }
    };

    const handleDownload = async () => {
        if (disableExportActions) return;
        setLoadingAction("download");
        try {
            await onDownload();
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold text-slate-900 dark:text-white">Nguồn thu nhập</h5>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            disabled={isBusy || disableExportActions}
                            className={`${cardBtnBase} ${isBusy || disableExportActions ? "cursor-not-allowed opacity-60" : ""}`}
                            onClick={handleEmail}
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
                            disabled={isBusy || disableExportActions}
                            className={`${cardBtnBase} ${isBusy || disableExportActions ? "cursor-not-allowed opacity-60" : ""}`}
                            onClick={handleDownload}
                            title={disableExportActions ? disabledMessage : ""}
                            type="button"
                        >
                            {loadingAction === "download" ? (
                                <><LoaderCircle className="w-4 h-4 animate-spin"/>Đang tải...</>
                            ) : (
                                <><Download size={15} />Tải xuống</>
                            )}
                        </button>
                    </div>
                    {disableExportActions && disabledMessage ? (
                        <p className="max-w-xs text-right text-xs text-amber-600 dark:text-amber-400">{disabledMessage}</p>
                    ) : null}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                {transactions?.map((income) => (
                    <TransactionInfoCard
                        key={income.id}
                        title={income.name}
                        icon={income.icon}
                        date={moment(income.date).format('DD/MM/YYYY')}
                        amount={income.amount}
                        type="income"
                        onDelete={() => onDelete(income.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default IncomeList;
