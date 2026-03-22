import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CreditCard, Activity, Wallet } from "lucide-react";
import axiosConfig from "../../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../../util/apiEndpoints.js";

const formatMoney = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
};

const StatCard = ({ title, value, change, isPositive, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{value}</p>
        <div className="flex items-center gap-2 mt-2">
          {change && (
            <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{change}
            </span>
          )}
          <span className="text-xs text-slate-400">from last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl bg-slate-50 ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalPayments: 0,
    paidPayments: 0,
    systemStatus: "Online"
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [overviewResponse, paymentsResponse] = await Promise.all([
          axiosConfig.get(API_ENDPOINTS.ADMIN_OVERVIEW),
          axiosConfig.get(API_ENDPOINTS.ADMIN_PAYMENTS, {
            params: {
              status: "ALL",
              limit: 5
            }
          })
        ]);

        setOverview((prev) => ({ ...prev, ...(overviewResponse.data || {}) }));
        setRecentPayments(Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Không thể tải dữ liệu dashboard");
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Overview</h1>
        <p className="mt-2 text-slate-500">Welcome to the admin dashboard. Monitor and manage your application here.</p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={overview.totalUsers?.toLocaleString("vi-VN") || "0"}
          isPositive={true}
          icon={Users}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Active Subscriptions"
          value={overview.activeSubscriptions?.toLocaleString("vi-VN") || "0"}
          isPositive={true}
          icon={CreditCard}
          colorClass="text-indigo-600"
        />
        <StatCard
          title="System Status"
          value={overview.systemStatus || "Online"}
          icon={Activity}
          colorClass="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Payments"
          value={overview.totalPayments?.toLocaleString("vi-VN") || "0"}
          icon={Wallet}
          colorClass="text-purple-600"
        />
        <StatCard
          title="Paid Payments"
          value={overview.paidPayments?.toLocaleString("vi-VN") || "0"}
          icon={CreditCard}
          colorClass="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Payments</h3>
          {recentPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <Wallet size={48} className="text-slate-300 mb-3" />
              <p className="font-medium text-slate-500">No payment data found</p>
              <p className="text-sm text-slate-400 mt-1">Check back later for updates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.orderCode} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-semibold text-slate-700">#{payment.orderCode} • {payment.planName || payment.planId || "N/A"}</p>
                      <p className="text-sm text-slate-500">{payment.payerEmail || "Unknown user"}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDateTime(payment.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{formatMoney(payment.amount)}</p>
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs mt-1">
                        {payment.status || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/payments")}
              className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition text-left group"
            >
              <div>
                <span className="block font-medium text-slate-700 group-hover:text-blue-700">Manage Payments</span>
                <span className="block text-sm text-slate-500 group-hover:text-blue-500">View and track payment transactions</span>
              </div>
              <span className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={() => navigate("/admin/settings")}
              className="w-full flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition text-left group"
            >
              <div>
                <span className="block font-medium text-slate-700 group-hover:text-indigo-700">System Settings</span>
                <span className="block text-sm text-slate-500 group-hover:text-indigo-500">Configure app parameters</span>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
