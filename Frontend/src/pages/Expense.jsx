import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext.jsx";
import { useUser } from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import Dashboard from "../components/Dashboard.jsx";
import ExpenseOverview from "../components/ExpenseOverview.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import Modal from "../components/Modal.jsx";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";
import TransactionOtpModal from "../components/TransactionOtpModal.jsx";

const Expense = () => {
    useUser();
    const { user } = useContext(AppContext);
    const [expenseData, setExpenseData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
    const [openExpenseOtpModal, setOpenExpenseOtpModal] = useState(false);
    const [openDeleteExpenseOtpModal, setOpenDeleteExpenseOtpModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });

    const [pendingExpense, setPendingExpense] = useState(null);
    const [pendingDeleteExpense, setPendingDeleteExpense] = useState(null);

    const [addOtpRequestId, setAddOtpRequestId] = useState(null);
    const [addOtpMeta, setAddOtpMeta] = useState(null);
    const [addOtpCode, setAddOtpCode] = useState("");
    const [addOtpStatusMessage, setAddOtpStatusMessage] = useState("");
    const [addOtpError, setAddOtpError] = useState("");
    const [isRequestingAddOtp, setIsRequestingAddOtp] = useState(false);
    const [isSubmittingAddWithOtp, setIsSubmittingAddWithOtp] = useState(false);

    const [deleteOtpRequestId, setDeleteOtpRequestId] = useState(null);
    const [deleteOtpMeta, setDeleteOtpMeta] = useState(null);
    const [deleteOtpCode, setDeleteOtpCode] = useState("");
    const [deleteOtpStatusMessage, setDeleteOtpStatusMessage] = useState("");
    const [deleteOtpError, setDeleteOtpError] = useState("");
    const [isRequestingDeleteOtp, setIsRequestingDeleteOtp] = useState(false);
    const [isSubmittingDeleteWithOtp, setIsSubmittingDeleteWithOtp] = useState(false);

    const [now, setNow] = useState(Date.now());

    const exportUpgradeMessage = "Tinh nang xuat bao cao chi co tu goi Co Ban. Vui long nang cap de tiep tuc.";
    const exportLocked = user?.canExportReports === false;

    useEffect(() => {
        const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(intervalId);
    }, []);

    const fetchExpenseDetails = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSE);
            if (response.data) {
                setExpenseData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch expense details:", error);
            toast.error("Khong the tai danh sach chi tieu.");
        } finally {
            setLoading(false);
        }
    };

    const fetchExpenseCategories = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE("expense"));
            if (response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch expense categories:", error);
            toast.error("Khong the tai danh muc chi tieu.");
        }
    };

    const handleAddExpense = async (expense) => {
        const { name, categoryId, amount, date, icon } = expense;

        if (!name.trim()) {
            toast.error("Vui long nhap ten giao dich.");
            return;
        }

        if (!categoryId) {
            toast.error("Vui long chon danh muc.");
            return;
        }

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("So tien phai lon hon 0.");
            return;
        }

        if (!date) {
            toast.error("Vui long chon ngay.");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        if (date > today) {
            toast.error("Ngay khong duoc lon hon hien tai.");
            return;
        }

        const normalizedExpense = {
            name: name.trim(),
            categoryId: Number(categoryId),
            amount: Number(amount),
            date,
            icon,
        };

        setPendingExpense(normalizedExpense);
        await requestExpenseOtp(normalizedExpense);
    };

    const requestExpenseOtp = async (expensePayload = pendingExpense) => {
        if (!expensePayload) {
            toast.error("Khong co du lieu chi tieu de xac thuc OTP.");
            return;
        }

        setIsRequestingAddOtp(true);
        setAddOtpError("");
        setAddOtpStatusMessage("");

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.REQUEST_TRANSACTION_OTP, {
                actionType: "EXPENSE",
                name: expensePayload.name,
                categoryId: expensePayload.categoryId,
                amount: expensePayload.amount,
                date: expensePayload.date,
            });

            setAddOtpRequestId(response.data.otpRequestId);
            setAddOtpMeta(response.data);
            setAddOtpCode("");
            setAddOtpStatusMessage(response.data.message || "Ma OTP da duoc gui toi email cua ban.");
            setOpenAddExpenseModal(false);
            setOpenExpenseOtpModal(true);
            toast.success(response.data.message || "Da gui OTP xac nhan.");
        } catch (error) {
            const message = error.response?.data?.message || "Khong the gui OTP chi tieu.";
            setAddOtpError(message);
            toast.error(message);
        } finally {
            setIsRequestingAddOtp(false);
        }
    };

    const submitExpenseWithOtp = async () => {
        if (!pendingExpense) {
            setAddOtpError("Khong co du lieu chi tieu dang cho xac nhan.");
            return;
        }

        if (!addOtpRequestId) {
            setAddOtpError("Vui long yeu cau OTP truoc.");
            return;
        }

        if (!addOtpCode.trim()) {
            setAddOtpError("Vui long nhap ma OTP.");
            return;
        }

        setIsSubmittingAddWithOtp(true);
        setAddOtpError("");

        try {
            const verifyResponse = await axiosConfig.post(API_ENDPOINTS.VERIFY_TRANSACTION_OTP, {
                otpRequestId: addOtpRequestId,
                otpCode: addOtpCode.trim(),
            });

            const response = await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, {
                ...pendingExpense,
                transactionAuthorizationToken: verifyResponse.data.transactionAuthorizationToken,
            });

            setOpenExpenseOtpModal(false);
            resetAddOtpState();
            toast.success("Them chi tieu thanh cong");

            const budgetStatus = response.data?.budgetStatus;
            if (budgetStatus?.hasBudget) {
                const fmt = (n) =>
                    new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                    }).format(n);
                const pct = (budgetStatus.usageRatio * 100).toFixed(1);

                if (budgetStatus.isExceeded) {
                    toast.error(
                        `Vuot han muc "${budgetStatus.categoryName}"! Da chi ${fmt(budgetStatus.totalSpent)} / ${fmt(budgetStatus.amountLimit)} (${pct}%)`,
                        { duration: 6000 }
                    );
                } else if (budgetStatus.isWarning) {
                    toast(
                        `Sap het han muc "${budgetStatus.categoryName}". Da chi ${fmt(budgetStatus.totalSpent)} / ${fmt(budgetStatus.amountLimit)} (${pct}%)`,
                        { duration: 5000 }
                    );
                }
            }

            fetchExpenseDetails();
            fetchExpenseCategories();
        } catch (error) {
            const message = error.response?.data?.message || "Khong the them chi tieu.";
            setAddOtpError(message);
            toast.error(message);
        } finally {
            setIsSubmittingAddWithOtp(false);
        }
    };

    const openDeleteConfirmation = (expense) => {
        setOpenDeleteAlert({ show: true, data: expense });
    };

    const requestDeleteExpenseOtp = async (expensePayload = pendingDeleteExpense) => {
        if (!expensePayload?.id) {
            toast.error("Khong tim thay chi tieu can xoa.");
            return;
        }

        setIsRequestingDeleteOtp(true);
        setDeleteOtpError("");
        setDeleteOtpStatusMessage("");

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.REQUEST_TRANSACTION_OTP, {
                actionType: "DELETE_EXPENSE",
                expenseId: expensePayload.id,
            });

            setDeleteOtpRequestId(response.data.otpRequestId);
            setDeleteOtpMeta(response.data);
            setDeleteOtpCode("");
            setDeleteOtpStatusMessage(response.data.message || "Ma OTP da duoc gui toi email cua ban.");
            setOpenDeleteAlert({ show: false, data: null });
            setOpenDeleteExpenseOtpModal(true);
            toast.success(response.data.message || "Da gui OTP xac nhan xoa.");
        } catch (error) {
            const message = error.response?.data?.message || "Khong the gui OTP xoa chi tieu.";
            setDeleteOtpError(message);
            toast.error(message);
        } finally {
            setIsRequestingDeleteOtp(false);
        }
    };

    const prepareDeleteExpenseOtp = async (expensePayload) => {
        setPendingDeleteExpense(expensePayload);
        await requestDeleteExpenseOtp(expensePayload);
    };

    const deleteExpenseWithOtp = async () => {
        if (!pendingDeleteExpense?.id) {
            setDeleteOtpError("Khong tim thay chi tieu dang cho xoa.");
            return;
        }

        if (!deleteOtpRequestId) {
            setDeleteOtpError("Vui long yeu cau OTP truoc.");
            return;
        }

        if (!deleteOtpCode.trim()) {
            setDeleteOtpError("Vui long nhap ma OTP.");
            return;
        }

        setIsSubmittingDeleteWithOtp(true);
        setDeleteOtpError("");

        try {
            const verifyResponse = await axiosConfig.post(API_ENDPOINTS.VERIFY_TRANSACTION_OTP, {
                otpRequestId: deleteOtpRequestId,
                otpCode: deleteOtpCode.trim(),
            });

            await axiosConfig.delete(API_ENDPOINTS.DELETE_EXPENSE(pendingDeleteExpense.id), {
                data: {
                    transactionAuthorizationToken: verifyResponse.data.transactionAuthorizationToken,
                },
            });

            setOpenDeleteExpenseOtpModal(false);
            resetDeleteOtpState();
            toast.success("Xoa chi tieu thanh cong");
            fetchExpenseDetails();
        } catch (error) {
            const message = error.response?.data?.message || "Khong the xoa chi tieu.";
            setDeleteOtpError(message);
            toast.error(message);
        } finally {
            setIsSubmittingDeleteWithOtp(false);
        }
    };

    const handleDownloadExpenseDetails = async () => {
        if (exportLocked) {
            toast.error(exportUpgradeMessage);
            return;
        }

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.EXPENSE_EXCEL_DOWNLOAD, {
                responseType: "blob",
            });

            const filename = "expense_details.xlsx";
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Tai xuat file chi tieu thanh cong");
        } catch (error) {
            console.error("Error downloading expense details:", error);
            toast.error(error.response?.data?.message || "Khong the tai file chi tieu.");
        }
    };

    const handleEmailExpenseDetails = async () => {
        if (exportLocked) {
            toast.error(exportUpgradeMessage);
            return;
        }

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.EMAIL_EXPENSE);
            if (response.status === 200) {
                toast.success("Gui email thanh cong");
            }
        } catch (error) {
            console.error("Error emailing expense details:", error);
            toast.error(error.response?.data?.message || "Khong the gui email chi tieu.");
        }
    };

    const resetAddOtpState = () => {
        setPendingExpense(null);
        setAddOtpRequestId(null);
        setAddOtpMeta(null);
        setAddOtpCode("");
        setAddOtpStatusMessage("");
        setAddOtpError("");
    };

    const resetDeleteOtpState = () => {
        setPendingDeleteExpense(null);
        setDeleteOtpRequestId(null);
        setDeleteOtpMeta(null);
        setDeleteOtpCode("");
        setDeleteOtpStatusMessage("");
        setDeleteOtpError("");
    };

    useEffect(() => {
        fetchExpenseDetails();
        fetchExpenseCategories();
    }, []);

    return (
        <Dashboard activeMenu="Expense">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <ExpenseOverview
                            transactions={expenseData}
                            onExpenseIncome={() => setOpenAddExpenseModal(true)}
                        />
                    </div>

                    <ExpenseList
                        transactions={expenseData}
                        onDelete={openDeleteConfirmation}
                        onDownload={handleDownloadExpenseDetails}
                        onEmail={handleEmailExpenseDetails}
                        disableExportActions={exportLocked}
                        disabledMessage={exportUpgradeMessage}
                    />

                    <Modal
                        isOpen={openAddExpenseModal}
                        onClose={() => setOpenAddExpenseModal(false)}
                        title="Them chi tieu"
                    >
                        <AddExpenseForm
                            onAddExpense={handleAddExpense}
                            categories={categories}
                        />
                    </Modal>

                    <Modal
                        isOpen={openDeleteAlert.show}
                        onClose={() => setOpenDeleteAlert({ show: false, data: null })}
                        title="Xoa chi tieu"
                    >
                        <DeleteAlert
                            content="Ban co chac chan muon xoa chi tieu nay khong?"
                            onDelete={() => prepareDeleteExpenseOtp(openDeleteAlert.data)}
                        />
                    </Modal>

                    <TransactionOtpModal
                        isOpen={openExpenseOtpModal}
                        onClose={() => {
                            setOpenExpenseOtpModal(false);
                            resetAddOtpState();
                        }}
                        title="Xac thuc OTP chi tieu"
                        actionLabel="them chi tieu"
                        maskedEmail={addOtpMeta?.maskedEmail || user?.email}
                        transactionName={pendingExpense?.name}
                        transactionAmount={pendingExpense?.amount ? `${Number(pendingExpense.amount).toLocaleString("vi-VN")} VND` : "--"}
                        transactionDate={pendingExpense?.date || "--"}
                        otpCode={addOtpCode}
                        onOtpChange={setAddOtpCode}
                        onRequestOtp={() => requestExpenseOtp()}
                        onConfirm={submitExpenseWithOtp}
                        isRequestingOtp={isRequestingAddOtp}
                        isConfirming={isSubmittingAddWithOtp}
                        otpRequestId={addOtpRequestId}
                        otpResendCountdown={getRemainingSeconds(addOtpMeta?.resendAvailableAt, now)}
                        otpExpiryCountdown={getRemainingSeconds(addOtpMeta?.otpExpiresAt, now)}
                        statusMessage={addOtpStatusMessage}
                        errorMessage={addOtpError}
                    />

                    <TransactionOtpModal
                        isOpen={openDeleteExpenseOtpModal}
                        onClose={() => {
                            setOpenDeleteExpenseOtpModal(false);
                            resetDeleteOtpState();
                        }}
                        title="Xac thuc OTP xoa chi tieu"
                        actionLabel="xoa chi tieu"
                        maskedEmail={deleteOtpMeta?.maskedEmail || user?.email}
                        transactionName={pendingDeleteExpense?.name}
                        transactionAmount={pendingDeleteExpense?.amount ? `${Number(pendingDeleteExpense.amount).toLocaleString("vi-VN")} VND` : "--"}
                        transactionDate={pendingDeleteExpense?.date || "--"}
                        otpCode={deleteOtpCode}
                        onOtpChange={setDeleteOtpCode}
                        onRequestOtp={() => requestDeleteExpenseOtp()}
                        onConfirm={deleteExpenseWithOtp}
                        isRequestingOtp={isRequestingDeleteOtp}
                        isConfirming={isSubmittingDeleteWithOtp}
                        otpRequestId={deleteOtpRequestId}
                        otpResendCountdown={getRemainingSeconds(deleteOtpMeta?.resendAvailableAt, now)}
                        otpExpiryCountdown={getRemainingSeconds(deleteOtpMeta?.otpExpiresAt, now)}
                        statusMessage={deleteOtpStatusMessage}
                        errorMessage={deleteOtpError}
                    />
                </div>
            </div>
        </Dashboard>
    );
};

const getRemainingSeconds = (value, now) => {
    if (!value) {
        return 0;
    }

    const targetTime = new Date(value).getTime();
    if (Number.isNaN(targetTime)) {
        return 0;
    }

    return Math.max(0, Math.ceil((targetTime - now) / 1000));
};

export default Expense;
