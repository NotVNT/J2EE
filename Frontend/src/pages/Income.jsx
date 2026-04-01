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
const Income = () => {
    useUser();
    const { user } = useContext(AppContext);
    const [incomeData, setIncomeData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filterType, setFilterType] = useState("current");
    const [selectedMonth, setSelectedMonth] = useState("");

    const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });

    const exportUpgradeMessage = "Tinh nang xuat bao cao chi co tu goi Co Ban. Vui long nang cap de tiep tuc.";
    const exportLocked = user?.canExportReports === false;



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

        try {
            const response = await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, normalizedIncome);
            if (response.status === 201) {
                setOpenAddIncomeModal(false);
                toast.success("Them thu nhap thanh cong");
                fetchIncomeDetails();
                fetchIncomeCategories();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Them thu nhap that bai");
        }
    };

    const openDeleteConfirmation = (income) => {
        setOpenDeleteAlert({ show: true, data: income });
    };

    const handleDeleteIncome = async () => {
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_INCOME(openDeleteAlert.data.id));
            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Xoa thu nhap thanh cong");
            fetchIncomeDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || "Xoa thu nhap that bai");
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
                            onDelete={handleDeleteIncome}
                        />
                    </Modal>

                </div>
            </div>
        </Dashboard>
    );
};



export default Income;
