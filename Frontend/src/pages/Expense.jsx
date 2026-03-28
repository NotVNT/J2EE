import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, Trash2 } from "lucide-react";
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
    const [isImportingReceipt, setIsImportingReceipt] = useState(false);
    const [isConfirmingImport, setIsConfirmingImport] = useState(false);
    const [openReceiptPreviewModal, setOpenReceiptPreviewModal] = useState(false);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const receiptFileInputRef = useRef(null);
    const exportLocked = user?.canExportReports === false;
    const receiptImportLocked = user?.canImportReceipt === false;
    const receiptImportUpgradeMessage = "Tính năng kiểm tra hoá đơn bằng ảnh chỉ có ở gói Premium. Vui long nang cap de tiep tuc";

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
                return response.data;
            }
            return [];
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

    const handleOpenReceiptPicker = () => {
        if (receiptImportLocked) {
            toast.error(receiptImportUpgradeMessage);
            return;
        }
        receiptFileInputRef.current?.click();
    };

    const handleImportReceipt = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const isImage = file.type?.startsWith("image/");
        if (!isImage) {
            toast.error("Vui lòng chọn tệp ảnh hóa đơn.");
            event.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setIsImportingReceipt(true);
        try {
            const response = await axiosConfig.post(API_ENDPOINTS.ANALYZE_EXPENSE_RECEIPT, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            const detectedCount = Number(response.data?.items?.length || 0);
            if (detectedCount <= 0) {
                toast.error("Không phát hiện được dòng chi tiêu hợp lệ trên hóa đơn.");
                return;
            }

            await fetchExpenseCategories();

            setReceiptPreview({
                merchant: response.data?.merchant || "",
                location: response.data?.location || "",
                receiptDate: response.data?.receiptDate || new Date().toISOString().split("T")[0],
                items: (response.data?.items || []).map((item) => ({
                    name: item?.name || "",
                    amount: item?.amount ?? "",
                    categoryId: item?.categoryId ?? "",
                    icon: item?.icon || "",
                    date: item?.date || response.data?.receiptDate || new Date().toISOString().split("T")[0]
                }))
            });
            setOpenReceiptPreviewModal(true);
            toast.success(`Đã quét ${detectedCount} sản phẩm. Vui lòng kiểm tra trước khi lưu.`);
        } catch (error) {
            console.error("Error importing receipt:", error);
            toast.error(error.response?.data?.message || "Không thể import hóa đơn.");
        } finally {
            setIsImportingReceipt(false);
            event.target.value = "";
        }
    };

    const handlePreviewFieldChange = (key, value) => {
        setReceiptPreview((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [key]: value,
            };
        });
    };

    const handlePreviewItemChange = (index, key, value) => {
        setReceiptPreview((prev) => {
            if (!prev) return prev;
            const nextItems = [...prev.items];
            nextItems[index] = {
                ...nextItems[index],
                [key]: value,
            };
            return {
                ...prev,
                items: nextItems,
            };
        });
    };

    const handleRemovePreviewItem = (index) => {
        setReceiptPreview((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                items: prev.items.filter((_, i) => i !== index),
            };
        });
    };

    const handleCloseReceiptPreview = () => {
        if (isConfirmingImport) {
            return;
        }
        setOpenReceiptPreviewModal(false);
        setReceiptPreview(null);
    };

    const handleConfirmReceiptImport = async () => {
        if (!receiptPreview) {
            return;
        }

        const cleanedItems = (receiptPreview.items || [])
            .map((item) => ({
                name: String(item.name || "").trim(),
                amount: Number(item.amount || 0),
                categoryId: Number(item.categoryId),
                icon: item.icon || "",
                date: item.date || receiptPreview.receiptDate,
            }))
            .filter((item) => item.name && item.amount > 0 && Number.isFinite(item.categoryId));

        if (cleanedItems.length === 0) {
            toast.error("Danh sách import không hợp lệ. Vui lòng kiểm tra lại sản phẩm.");
            return;
        }

        setIsConfirmingImport(true);
        try {
            const response = await axiosConfig.post(API_ENDPOINTS.CONFIRM_EXPENSE_RECEIPT_IMPORT, {
                merchant: receiptPreview.merchant || "",
                location: receiptPreview.location || "",
                receiptDate: receiptPreview.receiptDate || null,
                items: cleanedItems,
            });

            const importedCount = Number(response.data?.importedCount || 0);
            toast.success(`Đã lưu ${importedCount} khoản chi từ hóa đơn.`);
            setOpenReceiptPreviewModal(false);
            setReceiptPreview(null);
            fetchExpenseDetails();
        } catch (error) {
            console.error("Error confirming receipt import:", error);
            toast.error(error.response?.data?.message || "Không thể lưu dữ liệu hóa đơn.");
        } finally {
            setIsConfirmingImport(false);
        }
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
                            onImportReceipt={handleOpenReceiptPicker}
                            isImportingReceipt={isImportingReceipt}
                        />
                        <input
                            ref={receiptFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImportReceipt}
                            disabled={isImportingReceipt}
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
                    <Modal
                        isOpen={openReceiptPreviewModal}
                        onClose={handleCloseReceiptPreview}
                        title="Hóa đơn"
                    >
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Cửa hàng</label>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                                        value={receiptPreview?.merchant || ""}
                                        onChange={(e) => handlePreviewFieldChange("merchant", e.target.value)}
                                        placeholder="Tên cửa hàng"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Địa điểm hóa đơn</label>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2"
                                        value={receiptPreview?.location || ""}
                                        onChange={(e) => handlePreviewFieldChange("location", e.target.value)}
                                        placeholder="Số nhà, đường, quận..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Ngày hóa đơn</label>
                                <input
                                    type="date"
                                    className="w-full md:w-60 rounded-lg border border-gray-200 px-3 py-2"
                                    value={receiptPreview?.receiptDate || ""}
                                    onChange={(e) => handlePreviewFieldChange("receiptDate", e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                {(receiptPreview?.items || []).map((item, index) => (
                                    <div key={index} className="rounded-xl border border-gray-200 p-3">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                            <div className="md:col-span-4">
                                                <label className="block text-xs text-gray-500 mb-1">Tên sản phẩm</label>
                                                <input
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                                                    value={item.name || ""}
                                                    onChange={(e) => handlePreviewItemChange(index, "name", e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-500 mb-1">Số tiền</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                                                    value={item.amount ?? ""}
                                                    onChange={(e) => handlePreviewItemChange(index, "amount", e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
                                                <select
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white"
                                                    value={item.categoryId ?? ""}
                                                    onChange={(e) => handlePreviewItemChange(index, "categoryId", e.target.value)}
                                                >
                                                    <option value="">Chọn danh mục</option>
                                                    {categories.map((category) => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-500 mb-1">Ngày</label>
                                                <input
                                                    type="date"
                                                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                                                    value={item.date || receiptPreview?.receiptDate || ""}
                                                    onChange={(e) => handlePreviewItemChange(index, "date", e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-1 flex md:justify-end">
                                                <button
                                                    type="button"
                                                    className="rounded-lg border border-red-200 px-2 py-2 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleRemovePreviewItem(index)}
                                                    title="Xóa dòng"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-gray-700"
                                    onClick={handleCloseReceiptPreview}
                                    disabled={isConfirmingImport}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
                                    onClick={handleConfirmReceiptImport}
                                    disabled={isConfirmingImport}
                                >
                                    {isConfirmingImport ? (
                                        <span className="inline-flex items-center gap-2">
                                            <LoaderCircle size={16} className="animate-spin" />Đang lưu...
                                        </span>
                                    ) : "Xác nhận lưu vào chi tiêu"}
                                </button>
                            </div>
                        </div>
                    </Modal>
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
