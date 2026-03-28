import moment from "moment";
import {Download, LoaderCircle, Mail} from "lucide-react";
import {useState} from "react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";

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
        if (disableExportActions || !callback) {
            return;
        }

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
                <h5 className="text-lg">Tat ca chi tieu</h5>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            className={`card-btn ${isBusy || disableExportActions ? "cursor-not-allowed opacity-60" : ""}`}
                            disabled={isBusy || disableExportActions}
                            onClick={() => handleAction("email", onEmail)}
                            title={disableExportActions ? disabledMessage : ""}
                            type="button"
                        >
                            {loadingAction === "email" ? (
                                <>
                                    <LoaderCircle className="w-4 h-4 animate-spin"/>Dang gui Email...
                                </>
                            ) : (
                                <>
                                    <Mail size={15} className="text-base" />Gui Email
                                </>
                            )}
                        </button>
                        <button
                            className={`card-btn ${isBusy || disableExportActions ? "cursor-not-allowed opacity-60" : ""}`}
                            disabled={isBusy || disableExportActions}
                            onClick={() => handleAction("download", onDownload)}
                            title={disableExportActions ? disabledMessage : ""}
                            type="button"
                        >
                            {loadingAction === "download" ? (
                                <>
                                    <LoaderCircle className="w-4 h-4 animate-spin"/>Dang tai xuong...
                                </>
                            ) : (
                                <>
                                    <Download size={15} className="text-base" />Tai xuong
                                </>
                            )}
                        </button>
                    </div>
                    {disableExportActions && disabledMessage ? (
                        <p className="max-w-xs text-right text-xs text-amber-600">{disabledMessage}</p>
                    ) : null}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
                {transactions?.map((expense) => (
                    <TransactionInfoCard
                        key={expense.id}
                        title={expense.name}
                        icon={expense.icon}
                        date={moment(expense.date).format('DD/MM/YYYY')}
                        amount={expense.amount}
                        type="expense"
                        onDelete={() => onDelete(expense)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ExpenseList;
