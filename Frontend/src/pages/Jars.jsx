import { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import { useUser } from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import Dashboard from "../components/Dashboard.jsx";
import JarCard from "../components/JarCard.jsx";
import JarForm from "../components/JarForm.jsx";
import JarTransferModal from "../components/JarTransferModal.jsx";
import JarsSetup from "../components/JarsSetup.jsx";
import Modal from "../components/Modal.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { AppContext } from "../context/AppContext.jsx";
import { Plus, ArrowLeftRight, Vault, TrendingUp, TrendingDown, Wallet, AlertTriangle, ArrowLeft, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import TransactionInfoCard from "../components/TransactionInfoCard.jsx";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import EditExpenseForm from "../components/EditExpenseForm.jsx";
import { hasDisplayImage } from "../util/imageDisplay.js";
import { getTodayIsoDate, isIsoDateAfter } from "../util/dateInput.js";

const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n ?? 0);

const Jars = () => {
  useUser();
  usePageTitle("Hũ chi tiêu");

  const { user } = useContext(AppContext);

  const [jars, setJars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editJar, setEditJar] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedJarId, setSelectedJarId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [openEditExpenseModal, setOpenEditExpenseModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [openDeleteExpenseAlert, setOpenDeleteExpenseAlert] = useState({ show: false, id: null });

  const selectedJar = jars.find((j) => j.id === selectedJarId) || null;

  const fetchJars = async () => {
    setLoading(true);
    try {
      const res = await axiosConfig.get(API_ENDPOINTS.GET_JARS);
      if (res.data) setJars(res.data);
    } catch (err) {
      console.error("Lỗi tải hũ:", err);
      toast.error("Không thể tải danh sách hũ chi tiêu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axiosConfig.get(`${API_ENDPOINTS.GET_ALL_EXPENSE}?all=true`);
      if (res.data) setExpenses(res.data);
    } catch (err) {
      console.error("Lỗi tải chi tiêu:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosConfig.get(API_ENDPOINTS.CATEGORY_BY_TYPE("expense"));
      if (res.data) setCategories(res.data);
    } catch (err) {
      console.error("Lỗi tải danh mục chi tiêu:", err);
    }
  };

  useEffect(() => { fetchJars(); fetchExpenses(); fetchCategories(); }, []);

  const handleAddExpense = async (expense) => {
    const { name, categoryId, amount, date, icon, jarId } = expense;
    if (!name.trim()) { toast.error("Vui lòng nhập tên chi tiêu."); return; }
    if (!categoryId) { toast.error("Vui lòng chọn danh mục."); return; }
    if (!amount || isNaN(amount) || Number(amount) <= 0) { toast.error("Số tiền phải lớn hơn 0."); return; }
    if (!date) { toast.error("Vui lòng chọn ngày."); return; }
    const today = getTodayIsoDate();
    if (isIsoDateAfter(date, today)) { toast.error("Ngày không được chọn ở tương lai."); return; }

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, {
        name,
        categoryId: Number(categoryId),
        amount: Number(amount),
        date,
        icon,
        jarId: jarId ? Number(jarId) : null,
      });
      setOpenAddExpenseModal(false);
      toast.success("Thêm chi tiêu thành công");
      const budgetStatus = response.data?.budgetStatus;
      if (budgetStatus?.hasBudget) {
        const pct = (budgetStatus.usageRatio * 100).toFixed(1);
        if (budgetStatus.isExceeded) {
          toast.error(`🚨 Vượt hạn mức "${budgetStatus.categoryName}"!\nĐã chi ${fmt(budgetStatus.totalSpent)} / ${fmt(budgetStatus.amountLimit)} (${pct}%)`, { duration: 6000 });
        } else if (budgetStatus.isWarning) {
          toast(`⚠️ Sắp hết hạn mức "${budgetStatus.categoryName}"\nĐã chi ${fmt(budgetStatus.totalSpent)} / ${fmt(budgetStatus.amountLimit)} (${pct}%)`,
            { icon: "⚠️", duration: 5000, style: { background: "#f39c12", color: "#fff" } });
        }
      }
      fetchJars();
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Không thể thêm chi tiêu.");
    }
  };

  const handleUpdateExpense = async (expense) => {
    const { id, name, categoryId, amount, date, icon, jarId } = expense;
    if (!name.trim()) { toast.error("Vui lòng nhập tên chi tiêu."); return; }
    if (!categoryId) { toast.error("Vui lòng chọn danh mục."); return; }
    if (!amount || isNaN(amount) || Number(amount) <= 0) { toast.error("Số tiền phải lớn hơn 0."); return; }
    if (!date) { toast.error("Vui lòng chọn ngày."); return; }
    const today = getTodayIsoDate();
    if (isIsoDateAfter(date, today)) { toast.error("Ngày không được chọn ở tương lai."); return; }

    try {
      const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_EXPENSE(id), {
        name,
        categoryId: Number(categoryId),
        amount: Number(amount),
        date,
        icon,
        jarId: jarId ? Number(jarId) : null,
      });
      setOpenEditExpenseModal(false);
      setExpenseToEdit(null);
      toast.success("Cập nhật chi tiêu thành công");
      const budgetStatus = response.data?.budgetStatus;
      if (budgetStatus?.hasBudget) {
        const pct = (budgetStatus.usageRatio * 100).toFixed(1);
        if (budgetStatus.isExceeded) {
          toast.error(`🚨 Vượt hạn mức "${budgetStatus.categoryName}"!\nĐã chi ${fmt(budgetStatus.totalSpent)} / ${fmt(budgetStatus.amountLimit)} (${pct}%)`, { duration: 6000 });
        } else if (budgetStatus.isWarning) {
          toast(`⚠️ Sắp hết hạn mức "${budgetStatus.categoryName}"\nĐã chi ${fmt(budgetStatus.totalSpent)} / ${fmt(budgetStatus.amountLimit)} (${pct}%)`,
            { icon: "⚠️", duration: 5000, style: { background: "#f39c12", color: "#fff" } });
        }
      }
      fetchJars();
      fetchExpenses();
    } catch (error) {
      console.error("Error updating expense:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Không thể cập nhật chi tiêu.");
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_EXPENSE(id));
      setOpenDeleteExpenseAlert({ show: false, id: null });
      toast.success("Xóa chi tiêu thành công.");
      fetchJars();
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa chi tiêu.");
    }
  };

  const handleCreateJar = async (dto) => {
    try {
      await axiosConfig.post(API_ENDPOINTS.ADD_JAR, dto);
      toast.success("Tạo hũ chi tiêu thành công!");
      setShowAddModal(false);
      fetchJars();
    } catch (err) {
      toast.error(err.response?.data?.error || "Không thể tạo hũ. Vui lòng thử lại.");
    }
  };

  const handleUpdateJar = async (dto) => {
    try {
      const promises = [
        axiosConfig.put(API_ENDPOINTS.UPDATE_JAR(editJar.id), {
          name: dto.name,
          icon: dto.icon,
          color: dto.color,
          targetPercentage: dto.targetPercentage
        })
      ];

      if (dto.balancingJarId) {
        const balJar = jars.find(j => j.id === dto.balancingJarId);
        if (balJar) {
          const balNewPct = Math.max(0, (balJar.targetPercentage || 0) - dto.balancingPercentageDiff);
          promises.push(
            axiosConfig.put(API_ENDPOINTS.UPDATE_JAR(dto.balancingJarId), {
              name: balJar.name,
              icon: balJar.icon,
              color: balJar.color,
              targetPercentage: balNewPct
            })
          );
        }
      }

      await Promise.all(promises);
      toast.success("Cập nhật hũ và cân đối tỷ lệ phân bổ thành công!");
      setEditJar(null);
      fetchJars();
    } catch (err) {
      toast.error(err.response?.data?.error || "Không thể cập nhật hũ.");
    }
  };

  const handleDeleteJar = async (id) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_JAR(id));
      toast.success("Đã xoá hũ.");
      setDeleteAlert({ show: false, id: null });
      fetchJars();
    } catch (err) {
      toast.error(err.response?.data?.error || "Không thể xoá hũ.");
    }
  };

  const handleTransfer = async (fromJarId, toJarId, amount) => {
    try {
      await axiosConfig.post(API_ENDPOINTS.TRANSFER_JAR, { fromJarId, toJarId, amount });
      toast.success("Chuyển tiền thành công!");
      setShowTransferModal(false);
      fetchJars();
    } catch (err) {
      toast.error(err.response?.data?.error || "Không thể chuyển tiền.");
    }
  };

  const totalBalance = jars.reduce((sum, j) => sum + (j.currentBalance ?? 0), 0);
  const totalPercentage = jars.reduce((sum, j) => sum + (j.targetPercentage ?? 0), 0);

  const pieData = jars
    .filter((j) => j.currentBalance > 0)
    .map((j) => ({
      name: j.name,
      value: j.currentBalance,
      color: j.color || "#8B5CF6",
    }));

  const plan = user?.subscriptionPlan || "FREE";
  const maxJars = user?.jarLimit === -1 ? Infinity : (user?.jarLimit ?? 1);
  const canCreate = jars.length < maxJars;

  if (selectedJar) {
    const jarExpenses = expenses.filter(e => e.jarId === selectedJar.id);
    const categoryMap = {};
    jarExpenses.forEach(e => {
      categoryMap[e.categoryName] = (categoryMap[e.categoryName] || 0) + Number(e.amount);
    });
    
    const COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#F97316', '#14B8A6'];
    const chartData = Object.entries(categoryMap)
      .map(([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }))
      .sort((a, b) => b.value - a.value); // Sort by highest spend
      
    const sortedExpenses = [...jarExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    const actualPercent = totalBalance > 0
      ? ((selectedJar.currentBalance / totalBalance) * 100).toFixed(1)
      : "0.0";
    const progressWidth = Math.min(
      Math.abs(selectedJar.currentBalance) / (totalBalance > 0 ? totalBalance : 1) * 100,
      100
    );
    const isNegative = selectedJar.currentBalance < 0;

    return (
      <Dashboard activeMenu="Hũ chi tiêu">
        <div className="my-5 mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Top Navigation */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedJarId(null)} 
              className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm transition backdrop-blur-sm cursor-pointer"
            >
              <ArrowLeft size={18} className="text-slate-500 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Quay lại</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Info & Chart */}
            <div className="lg:col-span-1 space-y-6">
              {/* Jar Info Card */}
              <div className="card relative overflow-hidden">
                {/* Accent Background */}
                <div 
                  className="absolute top-0 left-0 w-full h-24 opacity-10"
                  style={{ backgroundColor: selectedJar.color || "#F59E0B" }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/20" 
                      style={{ backgroundColor: `${selectedJar.color || '#F59E0B'}20` }}
                    >
                      {selectedJar.icon ? (
                        hasDisplayImage(selectedJar.icon) ? (
                          <img src={selectedJar.icon} alt={selectedJar.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-2xl select-none">{selectedJar.icon}</span>
                        )
                      ) : (
                        <Vault size={28} style={{ color: selectedJar.color || "#F59E0B" }} />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedJar.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Mục tiêu: {selectedJar.targetPercentage ?? 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Số dư hiện tại</p>
                    <p className={`text-4xl font-bold tracking-tight ${isNegative ? "text-red-500" : "text-slate-800 dark:text-white"}`}>
                      {fmt(selectedJar.currentBalance)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tỷ trọng thực tế</span>
                      <span className="font-semibold" style={{ color: selectedJar.color || "#F59E0B" }}>
                        {actualPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-[width] duration-1000 ease-out relative"
                        style={{
                          width: `${progressWidth}%`,
                          backgroundColor: isNegative ? "#EF4444" : (selectedJar.color || "#F59E0B"),
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie Chart Card */}
              <div className="card">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <PieChartIcon size={18} className="text-slate-400" />
                  Cấu trúc chi tiêu
                </h3>
                
                {chartData.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <TrendingDown size={24} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có chi tiêu nào</p>
                    <p className="text-xs text-slate-400 mt-1">Các khoản chi từ hũ này sẽ hiện ở đây</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={5}
                          dataKey="value"
                          strokeWidth={0}
                          animationDuration={1000}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => fmt(value)}
                          contentStyle={{ 
                            backgroundColor: "rgba(15, 23, 42, 0.95)", 
                            border: "1px solid rgba(255,255,255,0.1)", 
                            borderRadius: "12px", 
                            color: "#fff", 
                            fontSize: "13px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                          }}
                          itemStyle={{ color: "#fff", fontWeight: 500 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="mt-6 space-y-3">
                      {chartData.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate flex-1">{item.name}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{fmt(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Transactions */}
            <div className="lg:col-span-2">
              <div className="card h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      Lịch sử giao dịch
                    </h3>
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                      {sortedExpenses.length} giao dịch
                    </span>
                  </div>
                  <button
                    onClick={() => setOpenAddExpenseModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                      bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    Thêm chi tiêu
                  </button>
                </div>
                
                {sortedExpenses.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <Vault size={96} className="text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
                    <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Hũ đang trống</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-[250px] mx-auto">Hãy thêm chi tiêu hoặc chuyển tiền vào hũ này để theo dõi dòng tiền.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar max-h-[600px] h-[600px]">
                    {sortedExpenses.map((expense, idx) => (
                      <div 
                        key={expense.id} 
                        className="animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${Math.min(idx * 50, 500)}ms`, animationFillMode: 'both' }}
                      >
                        <TransactionInfoCard
                          icon={expense.icon}
                          title={expense.name}
                          date={expense.date}
                          amount={expense.amount}
                          type="expense"
                          hideDeleteBtn={false}
                          onDelete={() => setOpenDeleteExpenseAlert({ show: true, id: expense.id })}
                          onEdit={() => { setExpenseToEdit(expense); setOpenEditExpenseModal(true); }}
                          category={expense.categoryName}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* ── Expense CRUD Modals for Detail View ── */}
        <Modal isOpen={openAddExpenseModal} onClose={() => setOpenAddExpenseModal(false)} title="Thêm chi tiêu vào hũ">
          <AddExpenseForm onAddExpense={handleAddExpense} categories={categories} defaultJarId={selectedJar?.id} jars={jars} />
        </Modal>

        <Modal isOpen={openEditExpenseModal} onClose={() => { setOpenEditExpenseModal(false); setExpenseToEdit(null); }} title="Chỉnh sửa chi tiêu">
          {expenseToEdit && (
            <EditExpenseForm onUpdateExpense={handleUpdateExpense} categories={categories} expenseToEdit={expenseToEdit} jars={jars} />
          )}
        </Modal>

        <Modal isOpen={openDeleteExpenseAlert.show} onClose={() => setOpenDeleteExpenseAlert({ show: false, id: null })} title="Xóa chi tiêu">
          <DeleteAlert
            content="Bạn có chắc chắn muốn xóa chi tiêu này không?"
            onDelete={() => handleDeleteExpense(openDeleteExpenseAlert.id)}
            onCancel={() => setOpenDeleteExpenseAlert({ show: false, id: null })}
          />
        </Modal>
      </Dashboard>
    );
  }

  if (jars.length === 0 && !loading) {
    return (
      <Dashboard activeMenu="Hũ chi tiêu">
        <div className="my-5 mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Vault size={28} className="text-amber-500" />
              Hũ chi tiêu
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Phân bổ thu nhập & quản lý tiền theo từng ví phụ
            </p>
          </div>
          <JarsSetup onComplete={fetchJars} />
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard activeMenu="Hũ chi tiêu">
      <div className="my-5 mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Vault size={28} className="text-amber-500" />
              Hũ chi tiêu
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Phân bổ thu nhập & quản lý tiền theo từng ví phụ
            </p>
          </div>
          <div className="flex gap-2">
            {jars.length >= 2 && (
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                  border border-slate-200 dark:border-white/10
                  text-slate-700 dark:text-slate-300
                  hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <ArrowLeftRight size={16} />
                Chuyển tiền
              </button>
            )}
            <button
              disabled={!canCreate}
              onClick={() => { if (canCreate) setShowAddModal(true); else toast.error(`Gói ${plan} chỉ cho phép tối đa ${maxJars} hũ. Hãy nâng cấp!`); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                bg-amber-500 text-white transition-colors shadow-sm
                ${canCreate ? "hover:bg-amber-600 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
            >
              <Plus size={16} />
              Tạo hũ mới
            </button>
          </div>
        </div>

        {/* ── Overview cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Wallet size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tổng số dư</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{fmt(totalBalance)}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
              <Vault size={20} className="text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Số hũ đang dùng</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{jars.length} / {maxJars === Infinity ? "∞" : maxJars}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tổng % phân bổ</p>
              <p className={`text-lg font-bold ${totalPercentage > 100 ? "text-red-500" : "text-slate-800 dark:text-white"}`}>
                {totalPercentage.toFixed(1)}%
                {totalPercentage > 100 && <AlertTriangle size={14} className="inline ml-1 text-red-500" />}
              </p>
            </div>
          </div>
        </div>

        {/* ── Pie Chart + Jar Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="card lg:col-span-1">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Phân bổ số dư</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => fmt(value)}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate flex-1">{item.name}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jar cards grid */}
          <div className={`${pieData.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}`}>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : jars.length === 0 ? (
              <div className="card text-center py-12">
                <Vault size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-2">Chưa có hũ chi tiêu nào</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Tạo hũ đầu tiên để bắt đầu phân bổ thu nhập</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Plus size={16} /> Tạo hũ mới
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jars.map((jar) => (
                  <JarCard
                    key={jar.id}
                    jar={jar}
                    totalBalance={totalBalance}
                    onClick={() => setSelectedJarId(jar.id)}
                    onEdit={() => setEditJar(jar)}
                    onDelete={() => setDeleteAlert({ show: true, id: jar.id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Modals ── */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tạo hũ chi tiêu mới">
          <JarForm onSave={handleCreateJar} onCancel={() => setShowAddModal(false)} />
        </Modal>

        <Modal isOpen={!!editJar} onClose={() => setEditJar(null)} title="Cập nhật hũ chi tiêu">
          <JarForm initialData={editJar} isEditing jars={jars} onSave={handleUpdateJar} onCancel={() => setEditJar(null)} />
        </Modal>

        <Modal isOpen={deleteAlert.show} onClose={() => setDeleteAlert({ show: false, id: null })} title="Xoá hũ chi tiêu">
          <DeleteAlert
            content="Bạn có chắc muốn xoá hũ này không? Số dư trong hũ sẽ bị mất."
            onDelete={() => handleDeleteJar(deleteAlert.id)}
            onCancel={() => setDeleteAlert({ show: false, id: null })}
          />
        </Modal>

        {showTransferModal && (
          <JarTransferModal
            jars={jars}
            onTransfer={handleTransfer}
            onClose={() => setShowTransferModal(false)}
          />
        )}

        {/* ── Expense CRUD Modals ── */}
        <Modal isOpen={openAddExpenseModal} onClose={() => setOpenAddExpenseModal(false)} title="Thêm chi tiêu vào hũ">
          <AddExpenseForm onAddExpense={handleAddExpense} categories={categories} defaultJarId={selectedJar?.id} jars={jars} />
        </Modal>

        <Modal isOpen={openEditExpenseModal} onClose={() => { setOpenEditExpenseModal(false); setExpenseToEdit(null); }} title="Chỉnh sửa chi tiêu">
          {expenseToEdit && (
            <EditExpenseForm onUpdateExpense={handleUpdateExpense} categories={categories} expenseToEdit={expenseToEdit} jars={jars} />
          )}
        </Modal>

        <Modal isOpen={openDeleteExpenseAlert.show} onClose={() => setOpenDeleteExpenseAlert({ show: false, id: null })} title="Xóa chi tiêu">
          <DeleteAlert
            content="Bạn có chắc chắn muốn xóa chi tiêu này không?"
            onDelete={() => handleDeleteExpense(openDeleteExpenseAlert.id)}
            onCancel={() => setOpenDeleteExpenseAlert({ show: false, id: null })}
          />
        </Modal>
      </div>
    </Dashboard>
  );
};

export default Jars;
