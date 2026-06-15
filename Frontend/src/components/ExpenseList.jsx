import moment from "moment";
import { LoaderCircle, Mail, FileSpreadsheet, Lock } from "lucide-react";
import { useState } from "react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import { useTranslation } from "../hooks/useTranslation.js";

const ExpenseList = ({
    transactions,
    onDelete,
    onEdit,
    onDownload,
    onEmail,
    disableExportActions = false,
    disabledMessage = "",
    calendarMonth,
}) => {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState("month");
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

    const filteredTransactions = viewMode === "month" && calendarMonth
        ? transactions?.filter((t) => moment(t.date).isSame(calendarMonth, "month"))
        : transactions;

    return (
        <div className="card">
            <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div>
                        <h5 className="text-lg font-semibold text-slate-900 dark:text-white">{t("expense.allExpenses")}</h5>
                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            {filteredTransactions?.length ?? 0} {t("expense.transactions")}
                        </p>
                    </div>

                    <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5 text-xs font-semibold w-fit">
                        <button
                            type="button"
                            onClick={() => setViewMode("month")}
                            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                                viewMode === "month"
                                    ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            }`}
                        >
                            {t("expense.byMonth")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("all")}
                            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                                viewMode === "all"
                                    ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            }`}
                        >
                            {t("expense.all")}
                        </button>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <button
                            disabled={isBusy || disableExportActions}
                            onClick={() => handleAction("email", onEmail)}
                            title={disableExportActions ? disabledMessage : t("expense.sendEmailReport")}
                            type="button"
                            className={[
                                "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
                                "hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-white/10 dark:hover:border-white/20 active:scale-95",
                                (isBusy || disableExportActions) ? "cursor-not-allowed opacity-50" : "",
                            ].join(" ")}
                        >
                            {loadingAction === "email" ? (
                                <><LoaderCircle size={14} className="animate-spin" />{t("auth.sending")}</>
                            ) : disableExportActions ? (
                                <><Lock size={14} />{t("expense.sendEmail")}</>
                            ) : (
                                <><Mail size={14} />{t("expense.sendEmail")}</>
                            )}
                        </button>

                        <button
                            disabled={isBusy || disableExportActions}
                            onClick={() => handleAction("download", onDownload)}
                            title={disableExportActions ? disabledMessage : t("expense.downloadExcel")}
                            type="button"
                            className={[
                                "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition shadow-sm active:scale-95",
                                disableExportActions
                                    ? "cursor-not-allowed border border-slate-200 bg-white text-slate-400 opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-500"
                                    : "border border-violet-500/30 bg-violet-600 text-white hover:bg-violet-500",
                            ].join(" ")}
                        >
                            {loadingAction === "download" ? (
                                <><LoaderCircle size={14} className="animate-spin" />{t("common.loading")}</>
                            ) : disableExportActions ? (
                                <><Lock size={14} />{t("expense.exportExcel")}</>
                            ) : (
                                <><FileSpreadsheet size={14} />{t("expense.exportExcel")}</>
                            )}
                        </button>
                    </div>

                    {disableExportActions && disabledMessage ? (
                        <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 sm:max-w-xs sm:text-right">
                            <Lock size={11} />
                            {disabledMessage}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
                {filteredTransactions?.map((expense) => (
                    <TransactionInfoCard
                        key={expense.id}
                        title={expense.name}
                        icon={expense.icon}
                        category={expense.categoryName}
                        receiptLocation={expense.receiptLocation}
                        date={moment(expense.date).format("DD/MM/YYYY")}
                        amount={expense.amount}
                        type="expense"
                        onDelete={() => onDelete(expense.id)}
                        onEdit={() => onEdit(expense)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ExpenseList;
