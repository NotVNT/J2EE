import { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import { useUser } from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import Dashboard from "../components/Dashboard.jsx";
import JarCard from "../components/JarCard.jsx";
import JarForm from "../components/JarForm.jsx";
import JarTransferModal from "../components/JarTransferModal.jsx";
import Modal from "../components/Modal.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { AppContext } from "../context/AppContext.jsx";
import { Plus, ArrowLeftRight, Vault, TrendingUp, Wallet, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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

  useEffect(() => { fetchJars(); }, []);

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
      await axiosConfig.put(API_ENDPOINTS.UPDATE_JAR(editJar.id), dto);
      toast.success("Cập nhật hũ thành công!");
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
  const maxJars = plan === "PREMIUM" ? Infinity : plan === "BASIC" ? 6 : 1;
  const canCreate = jars.length < maxJars;

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
              onClick={() => canCreate ? setShowAddModal(true) : toast.error(`Gói ${plan} chỉ cho phép tối đa ${maxJars} hũ. Hãy nâng cấp!`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm"
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
          <JarForm initialData={editJar} isEditing onSave={handleUpdateJar} onCancel={() => setEditJar(null)} />
        </Modal>

        <Modal isOpen={deleteAlert.show} onClose={() => setDeleteAlert({ show: false, id: null })} title="Xoá hũ chi tiêu">
          <DeleteAlert
            content="Bạn có chắc muốn xoá hũ này không? Số dư trong hũ sẽ bị mất."
            onDelete={() => handleDeleteJar(deleteAlert.id)}
          />
        </Modal>

        {showTransferModal && (
          <JarTransferModal
            jars={jars}
            onTransfer={handleTransfer}
            onClose={() => setShowTransferModal(false)}
          />
        )}
      </div>
    </Dashboard>
  );
};

export default Jars;
