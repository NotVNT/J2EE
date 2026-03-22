import { useEffect, useState } from "react";
import { RotateCcw, Save, SlidersHorizontal } from "lucide-react";

const ADMIN_SETTINGS_KEY = "admin_settings";

const defaultSettings = {
  autoRefresh: false,
  defaultPaymentStatus: "ALL",
  paymentPageSize: 20,
  compactTable: false
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ADMIN_SETTINGS_KEY) || "{}");
      setSettings({ ...defaultSettings, ...saved });
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    setMessage("Đã lưu cài đặt thành công");
    setTimeout(() => setMessage(""), 2500);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(defaultSettings));
    setMessage("Đã khôi phục cài đặt mặc định");
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h1>
        <p className="mt-2 text-slate-500">Cấu hình nhanh cho khu vực admin mà không ảnh hưởng chức năng hiện tại.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <SlidersHorizontal size={18} />
          Dashboard Preferences
        </h2>

        <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
          <div>
            <p className="font-medium text-slate-700">Auto refresh payment data</p>
            <p className="text-sm text-slate-500">Tự động làm mới danh sách thanh toán mỗi 20 giây</p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoRefresh}
            onChange={(e) => setSettings((prev) => ({ ...prev, autoRefresh: e.target.checked }))}
            className="w-5 h-5"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-2">Default payment status filter</span>
            <select
              value={settings.defaultPaymentStatus}
              onChange={(e) => setSettings((prev) => ({ ...prev, defaultPaymentStatus: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="ALL">ALL</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="UNDERPAID">UNDERPAID</option>
              <option value="FAILED">FAILED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-2">Rows per payment page</span>
            <select
              value={settings.paymentPageSize}
              onChange={(e) => setSettings((prev) => ({ ...prev, paymentPageSize: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
          <div>
            <p className="font-medium text-slate-700">Compact payment table</p>
            <p className="text-sm text-slate-500">Dùng kiểu bảng gọn cho màn hình nhỏ</p>
          </div>
          <input
            type="checkbox"
            checked={settings.compactTable}
            onChange={(e) => setSettings((prev) => ({ ...prev, compactTable: e.target.checked }))}
            className="w-5 h-5"
          />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <Save size={16} /> Save settings
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
          >
            <RotateCcw size={16} /> Reset default
          </button>
          {message && <span className="text-sm text-emerald-600 font-medium">{message}</span>}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
