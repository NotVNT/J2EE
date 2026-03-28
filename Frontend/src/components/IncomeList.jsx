import {Download, LoaderCircle, Mail} from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard.jsx";
import moment from "moment";
import {useState} from "react";

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
        if (disableExportActions) {
            return;
        }

        setLoadingAction("email");
        try {
            await onEmail();
        } finally {
            setLoadingAction(null);
        }
    };

    const handleDownload = async () => {
        if (disableExportActions) {
            return;
        }

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
                <h5 className="text-lg">Nguon thu nhap</h5>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center justify-end gap-2">
                        <button
                            disabled={isBusy || disableExportActions}
                            className={`card-btn ${isBusy || disableExportActions ? "cursor-not-allowed opacity-60" : ""}`}
                            onClick={handleEmail}
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
                            disabled={isBusy || disableExportActions}
                            className={`card-btn ${isBusy || disableExportActions ? "cursor-not-allowed opacity-60" : ""}`}
                            onClick={handleDownload}
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
                {transactions?.map((income) => (
                    <TransactionInfoCard
                        key={income.id}
                        title={income.name}
                        icon={income.icon}
                        date={moment(income.date).format('DD/MM/YYYY')}
                        amount={income.amount}
                        type="income"
                        onDelete={() => onDelete(income)}
                    />
                ))}
            </div>
        </div>
    );
};

export default IncomeList;
