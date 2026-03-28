import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";
import { useContext, useEffect, useState } from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import IncomeList from "../components/IncomeList.jsx";
import Modal from "../components/Modal.jsx";
import { Plus } from "lucide-react";
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
  const exportUpgradeMessage =
    "Tinh nang xuat bao cao chi co tu goi Co Ban. Vui long nang cap de tiep tuc.";
  const exportLocked = user?.canExportReports === false;

  // Fetch income details from the API
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
      toast.error(
        error.response?.data?.message || "Lấy chi tiết thu nhập thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for income
  const fetchIncomeCategories = async () => {
    try {
      const response = await axiosConfig.get(
        API_ENDPOINTS.CATEGORY_BY_TYPE("income"),
      );
      if (response.status === 200) {
        console.log("income categories", response.data);
        setCategories(response.data);
      }
    } catch (error) {
      console.log("Failed to fetch income categories:", error);
      toast.error(
        error.response?.data?.message || "Lấy danh mục thu nhập thất bại",
      );
    }
  };

  //save the income details
  const handleAddIncome = async (income) => {
    const { name, amount, date, icon, categoryId } = income;

    //validation
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Số tiền phải lớn hơn 0");
      return;
    }

    if (!date) {
      toast.error("Vui lòng chọn ngày");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (date > today) {
      toast.error("Date cannot be in the future");
      return;
    }

    if (!categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, {
        name,
        amount: Number(amount),
        date,
        icon,
        categoryId,
      });
      if (response.status === 201) {
        setOpenAddIncomeModal(false);
        toast.success("Thêm thu nhập thành công");
        fetchIncomeDetails();
        fetchIncomeCategories();
      }
    } catch (error) {
      console.log("Error adding income", error);
      toast.error(error.response?.data?.message || "Thêm thu nhập thất bại");
    }
  };

  //delete income details
  const deleteIncome = async (id) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_INCOME(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Xóa thu nhập thành công");
      fetchIncomeDetails();
    } catch (error) {
      console.log("Error deleting income", error);
      toast.error(error.response?.data?.message || "Xóa thu nhập thất bại");
    }
  };

  const handleDownloadIncomeDetails = async () => {
    if (exportLocked) {
      toast.error(exportUpgradeMessage);
      return;
    }

    try {
      const response = await axiosConfig.get(
        API_ENDPOINTS.INCOME_EXCEL_DOWNLOAD,
        { responseType: "blob" },
      );
      let filename = "income_details.xlsx";
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Tải xuống chi tiết thu nhập thành công");
    } catch (error) {
      console.error("Error downloading income details:", error);
      toast.error(error.response?.data?.message || "Failed to download income");
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
        toast.success("Gửi email chi tiết thu nhập thành công");
      }
    } catch (error) {
      console.error("Error emailing income details:", error);
      toast.error(error.response?.data?.message || "Failed to email income");
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
          {/* Time Filter UI */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-0">
              Khung thời gian
            </h3>
            <div className="flex gap-4 items-center">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-slate-900 border rounded-xl px-4 py-2 bg-gray-50 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              >
                <option value="current">Tháng này</option>
                <option value="all">Tất cả thời gian</option>
                <option value="specific">Chọn tháng</option>
              </select>
              {filterType === "specific" && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border rounded-xl px-4 py-2 bg-gray-50 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              )}
            </div>
          </div>

          <div>
            {/* overview for income with line char */}
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModal(true)}
            />
          </div>

          <IncomeList
            transactions={incomeData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadIncomeDetails}
            onEmail={handleEmailIncomeDetails}
            disableExportActions={exportLocked}
            disabledMessage={exportUpgradeMessage}
          />

          {/* Add Income Modal */}
          <Modal
            isOpen={openAddIncomeModal}
            onClose={() => setOpenAddIncomeModal(false)}
            title="Thêm thu nhập"
          >
            <AddIncomeForm
              onAddIncome={(income) => handleAddIncome(income)}
              categories={categories}
            />
          </Modal>

          {/* Delete Income Modal */}
          <Modal
            isOpen={openDeleteAlert.show}
            onClose={() => setOpenDeleteAlert({ show: false, data: null })}
            title="Xóa thu nhập"
          >
            <DeleteAlert
              content="Bạn có chắc chắn muốn xóa chi tiết thu nhập này?"
              onDelete={() => deleteIncome(openDeleteAlert.data)}
            />
          </Modal>
        </div>
      </div>
    </Dashboard>
  );
};

export default Income;
