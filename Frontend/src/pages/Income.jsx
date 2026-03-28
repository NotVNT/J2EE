import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";
import { useContext, useEffect, useState } from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import IncomeList from "../components/IncomeList.jsx";
import Modal from "../components/Modal.jsx";
import AddIncomeForm from "../components/AddIncomeForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";
import IncomeOverview from "../components/IncomeOverview.jsx";
import { AppContext } from "../context/AppContext.jsx";
import TransactionOtpModal from "../components/TransactionOtpModal.jsx";

const Income = () => {
    useUser();
    const { user } = useContext(AppContext);
    const [incomeData, setIncomeData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filterType, setFilterType] = useState("current");
    const [selectedMonth, setSelectedMonth] = useState("");

    const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
    const [openIncomeOtpModal, setOpenIncomeOtpModal] = useState(false);
    const [openDeleteIncomeOtpModal, setOpenDeleteIncomeOtpModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });

    const [pendingIncome, setPendingIncome] = useState(null);
    const [pendingDeleteIncome, setPendingDeleteIncome] = useState(null);

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

    const fetchIncomeDetails = async () => {
        if (loading) return;

        setLoading(true);

        try {
            let url = API_ENDPOINTS.GET_ALL_INCOMES;
            if (filterType === "all") {
                url += "?all=true";
            } else if (filterType === "specific" && selectedMonth) {
                const [year, month] = selectedMonth.split("-");
                url += `?month=${month}&year=${year}`;
            }

            const response = await axiosConfig.get(url);
            if (response.status === 200) {
                setIncomeData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch income details:", error);
            toast.error(error.response?.data?.message || "Lay chi tiet thu nhap that bai");
        } finally {
            setLoading(false);
        }
    };

    const fetchIncomeCategories = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE("income"));
            if (response.status === 200) {
                setCategories(response.data);
            }
        } catch (error) {
            console.log("Failed to fetch income categories:", error);
            toast.error(error.response?.data?.message || "Lay danh muc thu nhap that bai");
        }
    };

    const handleAddIncome = async (income) => {
        const { name, amount, date, icon, categoryId } = income;

        if (!name.trim()) {
            toast.error("Vui long nhap ten");
            return;
        }

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("So tien phai lon hon 0");
            return;
        }

        if (!date) {
            toast.error("Vui long chon ngay");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        if (date > today) {
            toast.error("Ngay khong duoc o tuong lai");
            return;
        }

        if (!categoryId) {
            toast.error("Vui long chon danh muc");
            return;
        }

        const normalizedIncome = {
            name: name.trim(),
            amount: Number(amount),
            date,
            icon,
            categoryId: Number(categoryId),
        };

        setPendingIncome(normalizedIncome);
        await requestIncomeOtp(normalizedIncome);
    };

    const requestIncomeOtp = async (incomePayload = pendingIncome) => {
        if (!incomePayload) {
            toast.error("Khong co du lieu thu nhap de xac thuc OTP.");
            return;
        }

        setIsRequestingAddOtp(true);
        setAddOtpError("");
        setAddOtpStatusMessage("");

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.REQUEST_TRANSACTION_OTP, {
                actionType: "INCOME",
                name: incomePayload.name,
                categoryId: incomePayload.categoryId,
                amount: incomePayload.amount,
                date: incomePayload.date,
            });

            setAddOtpRequestId(response.data.otpRequestId);
            setAddOtpMeta(response.data);
            setAddOtpCode("");
            setAddOtpStatusMessage(response.data.message || "Ma OTP da duoc gui toi email cua ban.");
            setOpenAddIncomeModal(false);
            setOpenIncomeOtpModal(true);
            toast.success(response.data.message || "Da gui OTP xac nhan.");
        } catch (error) {
            const message = error.response?.data?.message || "Khong the gui OTP thu nhap.";
            setAddOtpError(message);
            toast.error(message);
        } finally {
            setIsRequestingAddOtp(false);
        }
    };

    const submitIncomeWithOtp = async () => {
        if (!pendingIncome) {
            setAddOtpError("Khong co du lieu thu nhap dang cho xac nhan.");
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

            const response = await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, {
                ...pendingIncome,
                transactionAuthorizationToken: verifyResponse.data.transactionAuthorizationToken,
            });

            if (response.status === 201) {
                resetAddOtpState();
                setOpenIncomeOtpModal(false);
                toast.success("Them thu nhap thanh cong");
                fetchIncomeDetails();
                fetchIncomeCategories();
            }
        } catch (error) {
            const message = error.response?.data?.message || "Them thu nhap that bai";
            setAddOtpError(message);
            toast.error(message);
        } finally {
            setIsSubmittingAddWithOtp(false);
        }
    };

    const openDeleteConfirmation = (income) => {
        setOpenDeleteAlert({ show: true, data: income });
    };

    const requestDeleteIncomeOtp = async (incomePayload = pendingDeleteIncome) => {
        if (!incomePayload?.id) {
            toast.error("Khong tim thay thu nhap can xoa.");
            return;
        }

        setIsRequestingDeleteOtp(true);
        setDeleteOtpError("");
        setDeleteOtpStatusMessage("");

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.REQUEST_TRANSACTION_OTP, {
                actionType: "DELETE_INCOME",
                incomeId: incomePayload.id,
            });

            setDeleteOtpRequestId(response.data.otpRequestId);
            setDeleteOtpMeta(response.data);
            setDeleteOtpCode("");
            setDeleteOtpStatusMessage(response.data.message || "Ma OTP da duoc gui toi email cua ban.");
            setOpenDeleteAlert({ show: false, data: null });
            setOpenDeleteIncomeOtpModal(true);
            toast.success(response.data.message || "Da gui OTP xac nhan xoa.");
        } catch (error) {
            const message = error.response?.data?.message || "Khong the gui OTP xoa thu nhap.";
            setDeleteOtpError(message);
            toast.error(message);
        } finally {
            setIsRequestingDeleteOtp(false);
        }
    };

    const prepareDeleteIncomeOtp = async (incomePayload) => {
        setPendingDeleteIncome(incomePayload);
        await requestDeleteIncomeOtp(incomePayload);
    };

    const deleteIncomeWithOtp = async () => {
        if (!pendingDeleteIncome?.id) {
            setDeleteOtpError("Khong tim thay thu nhap dang cho xoa.");
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

            await axiosConfig.delete(API_ENDPOINTS.DELETE_INCOME(pendingDeleteIncome.id), {
                data: {
                    transactionAuthorizationToken: verifyResponse.data.transactionAuthorizationToken,
                },
            });

            setOpenDeleteIncomeOtpModal(false);
            resetDeleteOtpState();
            toast.success("Xoa thu nhap thanh cong");
            fetchIncomeDetails();
        } catch (error) {
            const message = error.response?.data?.message || "Xoa thu nhap that bai";
            setDeleteOtpError(message);
            toast.error(message);
        } finally {
            setIsSubmittingDeleteWithOtp(false);
        }
    };

    const handleDownloadIncomeDetails = async () => {
        if (exportLocked) {
            toast.error(exportUpgradeMessage);
            return;
        }

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.INCOME_EXCEL_DOWNLOAD, { responseType: "blob" });
            const filename = "income_details.xlsx";
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Tai xuong chi tiet thu nhap thanh cong");
        } catch (error) {
            console.error("Error downloading income details:", error);
            toast.error(error.response?.data?.message || "Khong the tai file thu nhap");
        }
    };

    const handleEmailIncomeDetails = async () => {
        if (exportLocked) {
            toast.error(exportUpgradeMessage);
            return;
        }

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.EMAIL_INCOME);
            if (response.status === 200) {
                toast.success("Gui email chi tiet thu nhap thanh cong");
            }
        } catch (error) {
            console.error("Error emailing income details:", error);
            toast.error(error.response?.data?.message || "Khong the gui email thu nhap");
        }
    };

    const resetAddOtpState = () => {
        setPendingIncome(null);
        setAddOtpRequestId(null);
        setAddOtpMeta(null);
        setAddOtpCode("");
        setAddOtpStatusMessage("");
        setAddOtpError("");
    };

    const resetDeleteOtpState = () => {
        setPendingDeleteIncome(null);
        setDeleteOtpRequestId(null);
        setDeleteOtpMeta(null);
        setDeleteOtpCode("");
        setDeleteOtpStatusMessage("");
        setDeleteOtpError("");
    };

    useEffect(() => {
        fetchIncomeCategories();
    }, []);

    useEffect(() => {
        if (filterType === "specific" && !selectedMonth) return;
        fetchIncomeDetails();
    }, [filterType, selectedMonth]);

    return (
        <Dashboard activeMenu="Income">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex flex-col items-center justify-between rounded-2xl border border-gray-200/50 bg-white p-4 shadow-sm sm:flex-row">
                        <h3 className="mb-3 text-lg font-semibold text-gray-800 sm:mb-0">Khung thoi gian</h3>
                        <div className="flex items-center gap-4">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="rounded-xl border bg-gray-50 px-4 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            >
                                <option value="current">Thang nay</option>
                                <option value="all">Tat ca thoi gian</option>
                                <option value="specific">Chon thang</option>
                            </select>
                            {filterType === "specific" && (
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="rounded-xl border bg-gray-50 px-4 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <IncomeOverview transactions={incomeData} onAddIncome={() => setOpenAddIncomeModal(true)} />
                    </div>

                    <IncomeList
                        transactions={incomeData}
                        onDelete={openDeleteConfirmation}
                        onDownload={handleDownloadIncomeDetails}
                        onEmail={handleEmailIncomeDetails}
                        disableExportActions={exportLocked}
                        disabledMessage={exportUpgradeMessage}
                    />

                    <Modal
                        isOpen={openAddIncomeModal}
                        onClose={() => setOpenAddIncomeModal(false)}
                        title="Them thu nhap"
                    >
                        <AddIncomeForm
                            onAddIncome={(income) => handleAddIncome(income)}
                            categories={categories}
                        />
                    </Modal>

                    <Modal
                        isOpen={openDeleteAlert.show}
                        onClose={() => setOpenDeleteAlert({ show: false, data: null })}
                        title="Xoa thu nhap"
                    >
                        <DeleteAlert
                            content="Ban co chac chan muon xoa chi tiet thu nhap nay?"
                            onDelete={() => prepareDeleteIncomeOtp(openDeleteAlert.data)}
                        />
                    </Modal>

                    <TransactionOtpModal
                        isOpen={openIncomeOtpModal}
                        onClose={() => {
                            setOpenIncomeOtpModal(false);
                            resetAddOtpState();
                        }}
                        title="Xac thuc OTP thu nhap"
                        actionLabel="them thu nhap"
                        maskedEmail={addOtpMeta?.maskedEmail || user?.email}
                        transactionName={pendingIncome?.name}
                        transactionAmount={pendingIncome?.amount ? `${Number(pendingIncome.amount).toLocaleString("vi-VN")} VND` : "--"}
                        transactionDate={pendingIncome?.date || "--"}
                        otpCode={addOtpCode}
                        onOtpChange={setAddOtpCode}
                        onRequestOtp={() => requestIncomeOtp()}
                        onConfirm={submitIncomeWithOtp}
                        isRequestingOtp={isRequestingAddOtp}
                        isConfirming={isSubmittingAddWithOtp}
                        otpRequestId={addOtpRequestId}
                        otpResendCountdown={getRemainingSeconds(addOtpMeta?.resendAvailableAt, now)}
                        otpExpiryCountdown={getRemainingSeconds(addOtpMeta?.otpExpiresAt, now)}
                        statusMessage={addOtpStatusMessage}
                        errorMessage={addOtpError}
                    />

                    <TransactionOtpModal
                        isOpen={openDeleteIncomeOtpModal}
                        onClose={() => {
                            setOpenDeleteIncomeOtpModal(false);
                            resetDeleteOtpState();
                        }}
                        title="Xac thuc OTP xoa thu nhap"
                        actionLabel="xoa thu nhap"
                        maskedEmail={deleteOtpMeta?.maskedEmail || user?.email}
                        transactionName={pendingDeleteIncome?.name}
                        transactionAmount={pendingDeleteIncome?.amount ? `${Number(pendingDeleteIncome.amount).toLocaleString("vi-VN")} VND` : "--"}
                        transactionDate={pendingDeleteIncome?.date || "--"}
                        otpCode={deleteOtpCode}
                        onOtpChange={setDeleteOtpCode}
                        onRequestOtp={() => requestDeleteIncomeOtp()}
                        onConfirm={deleteIncomeWithOtp}
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

export default Income;
