import Dashboard from "../components/Dashboard.jsx";
import { useUser } from "../hooks/useUser.jsx";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { safeOpenExternal } from "../util/safeNavigation.js";
import toast from "react-hot-toast";
import CustomSelect from "../components/CustomSelect.jsx";
import IncomeList from "../components/IncomeList.jsx";
import Modal from "../components/Modal.jsx";
import AddIncomeForm from "../components/AddIncomeForm.jsx";
import EditIncomeForm from "../components/EditIncomeForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";
import IncomeOverview from "../components/IncomeOverview.jsx";
import TransactionCalendar from "../components/TransactionCalendar.jsx";
import { AppContext } from "../context/AppContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { getTodayIsoDate, isIsoDateAfter } from "../util/dateInput.js";
import { buildIncomeListUrl, buildIncomeReportPayload } from "../util/incomeFilters.js";

const incomeFilterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "current", label: "Tháng này" },
  { value: "specific", label: "Chọn tháng" },
];

const Income = () => {
  useUser();
  usePageTitle("Thu nhập");
  const { user } = useContext(AppContext);
  const [incomeData, setIncomeData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => getTodayIsoDate().slice(0, 7));
  const [calendarMonth, setCalendarMonth] = useState(() => moment());
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [openEditIncomeModal, setOpenEditIncomeModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => getTodayIsoDate());
  const handleSelectCalendarDate = (date) => {
    setSelectedCalendarDate(date);
    setOpenAddIncomeModal(true);
  };
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });

  const exportUpgradeMessage = "Tính năng xuất báo cáo chỉ có từ gói Cơ Bản. Vui lòng nâng cấp để tiếp tục.";
  const exportLocked = user?.canExportReports === false;

  const fetchIncomeDetails = useCallback(async () => {
    try {
      const url = buildIncomeListUrl(API_ENDPOINTS.GET_ALL_INCOMES, {
        filterType,
        selectedMonth: selectedMonthDate,
      });
      if (!url) return;

      const response = await axiosConfig.get(url);
      if (response.status === 200) setIncomeData(response.data);
    } catch (error) {
      console.error("Failed to fetch income details:", error);
      toast.error(error.response?.data?.message || "Lấy chi tiết thu nhập thất bại");
    }
  }, [filterType, selectedMonthDate]);

  const fetchIncomeCategories = async () => {
    try {
      const response = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE("income"));
      if (response.status === 200) setCategories(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lấy danh mục thu nhập thất bại");
    }
  };

  const handleAddIncome = async (income) => {
    const { name, amount, date, icon, categoryId } = income;
    if (!name.trim()) { toast.error("Vui lòng nhập tên"); return; }
    if (!amount || isNaN(amount) || Number(amount) <= 0) { toast.error("Số tiền phải lớn hơn 0"); return; }
    if (!date) { toast.error("Vui lòng chọn ngày"); return; }
    const today = getTodayIsoDate();
    if (isIsoDateAfter(date, today)) { toast.error("Ngày không được chọn ở tương lai."); return; }
    if (!categoryId) { toast.error("Vui lòng chọn danh mục"); return; }
    try {
      const payload = { name, amount: Number(amount), date, icon, categoryId };
      if (income.allocations && income.allocations.length > 0) {
        payload.allocations = income.allocations;
      }
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, payload);
      if (response.status === 201) {
        setOpenAddIncomeModal(false);
        toast.success("Thêm thu nhập thành công");
        fetchIncomeDetails();
        fetchIncomeCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Thêm thu nhập thất bại");
    }
  };

  const handleUpdateIncome = async (id, updatedData) => {
    const { name, amount, date, icon, categoryId } = updatedData;
    if (!name.trim()) { toast.error("Vui lòng nhập tên"); return; }
    if (!amount || isNaN(amount) || Number(amount) <= 0) { toast.error("Số tiền phải lớn hơn 0"); return; }
    if (!date) { toast.error("Vui lòng chọn ngày"); return; }
    const today = getTodayIsoDate();
    if (isIsoDateAfter(date, today)) { toast.error("Ngày không được chọn ở tương lai."); return; }
    if (!categoryId) { toast.error("Vui lòng chọn danh mục"); return; }
    try {
      const payload = { name, amount: Number(amount), date, icon, categoryId };
      if (updatedData.allocations && updatedData.allocations.length > 0) {
        payload.allocations = updatedData.allocations;
      }
      const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_INCOME(id), payload);
      if (response.status === 200) {
        setOpenEditIncomeModal(false);
        setSelectedIncome(null);
        toast.success("Cập nhật thu nhập thành công");
        fetchIncomeDetails();
        fetchIncomeCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thu nhập thất bại");
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_INCOME(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Xóa thu nhập thành công");
      fetchIncomeDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa thu nhập thất bại");
    }
  };

  const handleDownloadIncomeDetails = async () => {
    if (exportLocked) { toast.error(exportUpgradeMessage); return; }
    try {
      const payload = buildIncomeReportPayload({ filterType, selectedMonth: selectedMonthDate });

      const response = await axiosConfig.post(API_ENDPOINTS.GENERATE_INCOME_REPORT, payload);
      
      if (response.data && response.data.presignedUrl && safeOpenExternal(response.data.presignedUrl)) {
        toast.success("Đã mở link tải báo cáo Excel!");
      } else {
        throw new Error("Không lấy được link tải báo cáo");
      }
    } catch (error) {
      if (error.response?.status === 429) {
        // Blob is used, so we need to parse the JSON error
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            toast.error(data.message || "Bạn thao tác quá nhanh.");
          } catch {
            toast.error("Bạn đã bị giới hạn tính năng này.");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo Excel.");
      }
    }
  };

  const handleEmailIncomeDetails = async () => {
    if (exportLocked) { toast.error(exportUpgradeMessage); return; }
    try {
      const response = await axiosConfig.get(API_ENDPOINTS.EMAIL_INCOME);
      if (response.status === 200) toast.success("Gửi email chi tiết thu nhập thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi email báo cáo.");
    }
  };

  useEffect(() => { fetchIncomeCategories(); }, []);
  useEffect(() => {
    if (filterType === "specific" && !selectedMonthDate) return;
    fetchIncomeDetails();
  }, [fetchIncomeDetails, filterType, selectedMonthDate]);

  const handleFilterTypeChange = (event) => {
    const nextFilterType = event.target.value;
    setFilterType(nextFilterType);
    if (nextFilterType === "specific" && !selectedMonthDate) {
      setSelectedMonthDate(getTodayIsoDate().slice(0, 7));
    }
  };

  return (
    <Dashboard activeMenu="Income">
      <div className="space-y-4 sm:space-y-6">

        <IncomeOverview onAddIncome={() => setOpenAddIncomeModal(true)} />

        <div className="card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h5 className="text-base font-bold text-slate-900 dark:text-white">Bộ lọc thu nhập</h5>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Chọn phạm vi dữ liệu hiển thị trên lịch và danh sách thu nhập.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-[180px_170px]">
              <CustomSelect
                value={filterType}
                onChange={handleFilterTypeChange}
                options={incomeFilterOptions}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-violet-500 dark:focus:border-amber-500"
              />

              <input
                type="month"
                value={selectedMonthDate}
                onChange={(event) => setSelectedMonthDate(event.target.value)}
                disabled={filterType !== "specific"}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-50 focus:border-violet-500 dark:focus:border-amber-500"
                aria-label="Chọn tháng thu nhập"
              />
            </div>
          </div>
        </div>

        <TransactionCalendar
          key={`income-calendar-${filterType}-${selectedMonthDate || "current"}`}
          transactions={incomeData}
          type="income"
          initialMonth={filterType === "specific" && selectedMonthDate ? selectedMonthDate : undefined}
          onEdit={(income) => { setSelectedIncome(income); setOpenEditIncomeModal(true); }}
          onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
          onSelectDate={handleSelectCalendarDate}
          onMonthChange={setCalendarMonth}
        />

        <IncomeList
          transactions={incomeData}
          onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
          onEdit={(income) => { setSelectedIncome(income); setOpenEditIncomeModal(true); }}
          onDownload={handleDownloadIncomeDetails}
          onEmail={handleEmailIncomeDetails}
          disableExportActions={exportLocked}
          disabledMessage={exportUpgradeMessage}
          calendarMonth={calendarMonth}
        />

        <Modal isOpen={openAddIncomeModal} onClose={() => setOpenAddIncomeModal(false)} title="Thêm thu nhập">
          <AddIncomeForm onAddIncome={(income) => handleAddIncome(income)} categories={categories} initialDate={selectedCalendarDate} />
        </Modal>

        <Modal isOpen={openEditIncomeModal} onClose={() => { setOpenEditIncomeModal(false); setSelectedIncome(null); }} title="Chỉnh sửa thu nhập">
          {selectedIncome && (
            <EditIncomeForm
              onUpdateIncome={handleUpdateIncome}
              categories={categories}
              incomeData={selectedIncome}
            />
          )}
        </Modal>

        <Modal isOpen={openDeleteAlert.show} onClose={() => setOpenDeleteAlert({ show: false, data: null })} title="Xóa thu nhập">
          <DeleteAlert 
            content="Bạn có chắc chắn muốn xóa chi tiết thu nhập này?" 
            onDelete={() => deleteIncome(openDeleteAlert.data)} 
            onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
          />
        </Modal>
      </div>
    </Dashboard>
  );
};

export default Income;
