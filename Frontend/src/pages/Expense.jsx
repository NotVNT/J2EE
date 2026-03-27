import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, Trash2 } from "lucide-react";
import { AppContext } from "../context/AppContext.jsx";
import {useUser} from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import Dashboard from "../components/Dashboard.jsx";
import ExpenseOverview from "../components/ExpenseOverview.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import Modal from "../components/Modal.jsx";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";

const Expense = () => {
    useUser();
    const { user } = useContext(AppContext);
    const [expenseData, setExpenseData] = useState([]);
    const [categories, setCategories] = useState([]); // New state for expense categories
    const [loading, setLoading] = useState(false);
    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });
    const [isImportingReceipt, setIsImportingReceipt] = useState(false);
    const [isConfirmingImport, setIsConfirmingImport] = useState(false);
    const [openReceiptPreviewModal, setOpenReceiptPreviewModal] = useState(false);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const receiptFileInputRef = useRef(null);
    const exportUpgradeMessage = "Nâng cấp gói để sử dụng tính năng này  ";
    const exportLocked = user?.canExportReports === false;
    const receiptImportLocked = user?.canImportReceipt === false;
    const receiptImportUpgradeMessage = "Tính năng kiểm tra hoá đơn bằng ảnh chỉ có ở gói Premium. Vui long nang cap de tiep tuc";

    // Get All Expense Details
    const fetchExpenseDetails = async () => {
        if (loading) return; // Prevent multiple fetches if already loading

        setLoading(true);

        try {
            const response = await axiosConfig.get(
                `${API_ENDPOINTS.GET_ALL_EXPENSE}`
            );

            if (response.data) {
                setExpenseData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch expense details:", error);
            toast.error("Failed to fetch expense details.");
        } finally {
            setLoading(false);
        }
    };

    // New: Fetch Expense Categories
    const fetchExpenseCategories = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.CATEGORY_BY_TYPE("expense") // Fetch categories of type 'expense'
            );
            if (response.data) {
                setCategories(response.data);
                return response.data;
            }
            return [];
        } catch (error) {
            console.error("Failed to fetch expense categories:", error);
            toast.error("Failed to fetch expense categories.");
            return [];
        }
    };


    // Handle Add Expense
    const handleAddExpense = async (expense) => {
        const { name, categoryId, amount, date, icon } = expense; // Changed 'category' to 'categoryId'

        if (!name.trim()) {
            toast.error("Name is required.");
            return;
        }

        // Validation Checks
        if (!categoryId) { // Validate categoryId now
            toast.error("Category is required.");
            return;
        }

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("Amount should be a valid number greater than 0.");
            return;
        }

        if (!date) {
            toast.error("Date is required.");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (date > today) {
            toast.error('Date cannot be in the future');
            return;
        }

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, {
                name,
                categoryId, // Pass categoryId to the API
                amount: Number(amount), // Ensure amount is a number
                date,
                icon,
            });

            setOpenAddExpenseModal(false);
            toast.success("Thêm chi tiêu thành công");

            // ─── Luồng Cảnh báo: Kiểm tra budgetStatus từ response ───
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
                        `🚨 Vượt hạn mức "${budgetStatus.categoryName}"!\n` +
                        `Đã chi ${fmt(budgetStatus.totalSpent)} / ${fmt(budgetStatus.amountLimit)} (${pct}%)`,
                        { duration: 6000 }
                    );
                } else if (budgetStatus.isWarning) {
                    toast(
                        `⚠️ Sắp hết hạn mức "${budgetStatus.categoryName}"\n` +
                        `Đã chi ${fmt(budgetStatus.totalSpent)} / ${fmt(budgetStatus.amountLimit)} (${pct}%)`,
                        { icon: "⚠️", duration: 5000, style: { background: "#f39c12", color: "#fff" } }
                    );
                }
            }
            // ────────────────────────────────────────────────────────

            fetchExpenseDetails(); // Refresh expense list
            fetchExpenseCategories();
        } catch (error) {
            console.error(
                "Error adding expense:",
                error.response?.data?.message || error.message
            );
            toast.error(error.response?.data?.message || "Failed to add expense.");
        }
    };

    // Delete Expense
    const deleteExpense = async (id) => {
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_EXPENSE(id));

            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Expense details deleted successfully");
            fetchExpenseDetails();
        } catch (error) {
            console.error(
                "Error deleting expense:",
                error.response?.data?.message || error.message
            );
            toast.error(error.response?.data?.message || "Failed to delete expense.");
        }
    };

    const handleDownloadExpenseDetails = async () => {
        if (exportLocked) {
            toast.error(exportUpgradeMessage);
            return;
        }

        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.EXPENSE_EXCEL_DOWNLOAD, // Ensure this path is correct, e.g., "/download/income"
                {
                    responseType: "blob", // Important: tells Axios to expect binary data
                }
            );

            // Extract filename from Content-Disposition header, or use a default
            let filename = "expense_details.xlsx"; // Default filename

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename); // Use the extracted or default filename
            document.body.appendChild(link);
            link.click(); // Programmatically click the link to trigger download
            link.parentNode.removeChild(link); // Clean up the link element
            window.URL.revokeObjectURL(url); // Release the object URL

            toast.success("Expense details downloaded successfully!");
        } catch (error) {
            console.error("Error downloading expense details:", error);
            toast.error(error.response?.data?.message || "Failed to download expense details. Please try again.");
        }
    };

    const handleEmailExpenseDetails = async () => {
        if (exportLocked) {
            toast.error(exportUpgradeMessage);
            return;
        }

        try {
            const response = await axiosConfig.get(API_ENDPOINTS.EMAIL_EXPENSE);
            if(response.status === 200) {
                toast.success("Email sent");
            }
        }catch (e) {
            console.error("Error emailing expense details:", e);
            toast.error(e.response?.data?.message || "Failed to email expense details. Please try again.");
        }
    }

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
        fetchExpenseCategories(); // Fetch categories when component mounts
    }, []);

    return (
        <Dashboard activeMenu="Expense">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div className="">
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
                        onDelete={(id) => {
                            setOpenDeleteAlert({ show: true, data: id });
                        }}
                        onDownload={handleDownloadExpenseDetails}
                        onEmail={handleEmailExpenseDetails}
                        disableExportActions={exportLocked}
                        disabledMessage={exportUpgradeMessage}
                    />

                    <Modal
                        isOpen={openAddExpenseModal}
                        onClose={() => setOpenAddExpenseModal(false)}
                        title="Thêm chi tiêu"
                    >
                        {/* Pass the fetched expense categories to the AddExpenseForm */}
                        <AddExpenseForm
                            onAddExpense={handleAddExpense}
                            categories={categories} // Pass categories here
                        />
                    </Modal>

                    <Modal
                        isOpen={openDeleteAlert.show}
                        onClose={() => setOpenDeleteAlert({ show: false, data: null })}
                        title="Xóa chi tiêu"
                    >
                        <DeleteAlert
                            content="Are you sure you want to delete this expense detail?"
                            onDelete={() => deleteExpense(openDeleteAlert.data)}
                        />
                    </Modal>

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

export default Expense;
