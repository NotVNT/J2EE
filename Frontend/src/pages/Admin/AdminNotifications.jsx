import { useState, useEffect } from "react";
import { Send, Bell, Clock, Search, RefreshCw } from "lucide-react";
import axiosConfig from "../../util/axiosConfig";
import { API_ENDPOINTS } from "../../util/apiEndpoints";
import toast from "react-hot-toast";

const AdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await axiosConfig.get(API_ENDPOINTS.ADMIN_NOTIFICATIONS);
      if (res.status === 200) {
        setBroadcasts(res.data);
      }
    } catch (error) {
      toast.error("Lỗi tải lịch sử thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosConfig.post(API_ENDPOINTS.ADMIN_BROADCAST, { title, message });
      if (res.status === 200) {
        toast.success("Gửi thông báo thành công!");
        setTitle("");
        setMessage("");
        fetchBroadcasts(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi gửi thông báo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBroadcasts = broadcasts.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="text-violet-500" />
            Gửi Thông Báo Hệ Thống
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gửi thông báo broadcast đến tất cả người dùng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Compose */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
            
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Soạn thông báo mới</h2>
            
            <form onSubmit={handleSendBroadcast} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Nhập tiêu đề thông báo..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                  placeholder="Nhập nội dung chi tiết..."
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  ) : (
                    <>
                      <Send size={18} /> Gửi đến tất cả
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-sm min-h-[500px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lịch sử thông báo</h2>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <button 
                  onClick={fetchBroadcasts}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Làm mới"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-violet-600 animate-spin"></div>
              </div>
            ) : filteredBroadcasts.length > 0 ? (
              <div className="space-y-4">
                {filteredBroadcasts.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-bold text-slate-800 dark:text-white">{b.title}</h3>
                      <span className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-[#1E293B] px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/5">
                        <Clock size={12} />
                        {new Date(b.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {b.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Bell size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">Chưa có thông báo nào được gửi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
