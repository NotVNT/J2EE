import { useEffect, useState } from "react";
import { Plus, Trash2, Save, X, Edit2 } from "lucide-react";
import { getPaymentPlans, savePaymentPlans, DEFAULT_PAYMENT_PLANS } from "../../util/paymentPlans.js";
import toast from "react-hot-toast";

const AdminSubscription = () => {
  const [plans, setPlans] = useState([]);
  const [editingPlanIndex, setEditingPlanIndex] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    setPlans(getPaymentPlans());
  }, []);

  const handleSaveAll = (newPlans) => {
    savePaymentPlans(newPlans);
    setPlans(newPlans);
    toast.success("Đã cập nhật các gói thanh toán");
  };

  const handleEdit = (index) => {
    setEditingPlanIndex(index);
    setFormData({ ...plans[index] });
  };

  const handleAddNew = () => {
    const newPlan = {
      id: "pkg_" + Date.now(),
      subscriptionPlan: "PREMIUM",
      displayName: "Gói mới",
      amount: 100000,
      description: "Mô tả gói dịch vụ",
      badge: "Mới",
      cycleLabel: "1 tháng",
      cycleMonths: 1,
      icon: "Star",
      accent: "from-blue-600 via-blue-500 to-indigo-500",
      features: ["Tính năng 1", "Tính năng 2"]
    };
    setEditingPlanIndex(plans.length);
    setFormData({ ...newPlan });
  };

  const handleDelete = (index) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa gói này?")) return;
    const newPlans = [...plans];
    newPlans.splice(index, 1);
    handleSaveAll(newPlans);
  };

  const handleSaveEdit = () => {
    const newPlans = [...plans];
    if (editingPlanIndex >= plans.length) {
      newPlans.push(formData);
    } else {
      newPlans[editingPlanIndex] = formData;
    }
    handleSaveAll(newPlans);
    setEditingPlanIndex(null);
    setFormData(null);
  };

  const cancelEdit = () => {
    setEditingPlanIndex(null);
    setFormData(null);
  };

  const handleReset = () => {
    if (window.confirm("Bạn có muốn khôi phục lại các gói mặc định không? Gói đang có sẽ bị mất.")) {
      handleSaveAll(DEFAULT_PAYMENT_PLANS);
    }
  };

  const updateFeature = (fIndex, val) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[fIndex] = val;
    setFormData({ ...formData, features: updatedFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, "Tính năng mới"] });
  };

  const removeFeature = (fIndex) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(fIndex, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Cấu hình gói dịch vụ</h1>
          <p className="mt-2 text-slate-500">Quản lý các gói thanh toán hiển thị cho người dùng</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50"
          >
            Khôi phục mặc định
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
          >
            <Plus size={18} /> Thêm gói
          </button>
        </div>
      </div>

      {editingPlanIndex !== null && formData ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              {editingPlanIndex >= plans.length ? "Thêm gói mới" : "Chỉnh sửa gói"}
            </h2>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 block mb-1">Tên gói hiển thị</span>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 block mb-1">Mã tham chiếu hệ thống (ID)</span>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 block mb-1">Giá kịch bản (VND)</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 block mb-1">Mức độ đặc quyền (Role)</span>
                <select
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="BASIC">BASIC</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Hệ thống phân biệt quyền truy cập dựa trên giá trị này</p>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 block mb-1">Nhãn thẻ (Badge)</span>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="VD: Phổ biến, Nâng cao..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 block mb-1">Chu kỳ (Số tháng)</span>
                <input
                  type="number"
                  value={formData.cycleMonths}
                  onChange={(e) => setFormData({ ...formData, cycleMonths: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 block mb-1">Nhãn chu kỳ hiển thị</span>
                <input
                  type="text"
                  value={formData.cycleLabel}
                  onChange={(e) => setFormData({ ...formData, cycleLabel: e.target.value })}
                  placeholder="VD: 1 tháng, 1 năm..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </label>

              <div className="block pt-2">
                <span className="text-sm font-medium text-slate-700 block mb-2">Tính năng của gói</span>
                <div className="space-y-2">
                  {formData.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(fIndex, e.target.value)}
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <button onClick={() => removeFeature(fIndex)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addFeature} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-2">
                    <Plus size={14} /> Thêm tính năng
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6 flex justify-end gap-3">
            <button onClick={cancelEdit} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl">Hủy</button>
            <button onClick={handleSaveEdit} className="px-5 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-xl flex items-center gap-2">
              <Save size={18} /> Lưu gói cước
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className={`h-2 w-full bg-gradient-to-r ${plan.accent}`}></div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full mb-3">
                      {plan.badge}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">{plan.displayName}</h3>
                    <p className="text-sm text-slate-500 mt-1">ID: {plan.id} • Quyền: {plan.subscriptionPlan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{plan.amount.toLocaleString()}đ</p>
                    <p className="text-sm text-slate-500 mt-1">/ {plan.cycleLabel}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 text-sm text-slate-600 mt-6 min-h-[100px]">
                  {plan.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-slate-400 text-xs italic">+ {plan.features.length - 3} tính năng khác...</li>
                  )}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
                <button onClick={() => handleEdit(index)} className="flex-1 flex justify-center items-center gap-2 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:border-blue-400 hover:text-blue-600 transition">
                  <Edit2 size={16} /> Chỉnh sửa
                </button>
                <button onClick={() => handleDelete(index)} className="p-2 border border-slate-200 bg-white rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
              <p>Chưa có gói thanh toán nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSubscription;
