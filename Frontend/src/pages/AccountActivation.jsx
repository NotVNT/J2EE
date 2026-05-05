import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle, MailWarning, TriangleAlert, Zap } from "lucide-react";
import Header from "../components/Header.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

const AccountActivation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Chúng tôi đang xác nhận tài khoản của bạn.");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("missing-token");
      setMessage("Liên kết kích hoạt này chưa đầy đủ. Vui lòng dùng liên kết mới nhất trong email.");
      return;
    }

    let isMounted = true;
    const activateAccount = async () => {
      try {
        const response = await axiosConfig.get(API_ENDPOINTS.ACTIVATE_ACCOUNT(token));
        if (!isMounted) return;
        setStatus("success");
        setMessage(response.data || "Tài khoản của bạn đã được kích hoạt thành công.");
      } catch (error) {
        if (!isMounted) return;
        setStatus("error");
        setMessage(error.response?.data || "Liên kết kích hoạt không hợp lệ, đã hết hạn hoặc đã được sử dụng.");
      }
    };
    activateAccount();
    return () => { isMounted = false; };
  }, [searchParams]);

  const statusConfig = {
    loading: {
      icon: <LoaderCircle className="animate-spin text-slate-400" size={26} />,
      badge: "Đang kích hoạt",
      badgeClass: "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10",
      iconBg: "bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/10",
      title: "Đang kiểm tra liên kết xác thực",
      msgClass: "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300",
    },
    success: {
      icon: <CheckCircle2 size={26} className="text-emerald-500" />,
      badge: "Kích hoạt thành công",
      badgeClass: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
      title: "Tài khoản của bạn đã sẵn sàng",
      msgClass: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    },
    error: {
      icon: <TriangleAlert size={26} className="text-amber-500" />,
      badge: "Kích hoạt thất bại",
      badgeClass: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
      iconBg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
      title: "Không thể kích hoạt tài khoản này",
      msgClass: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300",
    },
    "missing-token": {
      icon: <MailWarning size={26} className="text-blue-500" />,
      badge: "Liên kết không hợp lệ",
      badgeClass: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
      iconBg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
      title: "Liên kết xác thực đang thiếu thông tin",
      msgClass: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300",
    },
  };

  const cfg = statusConfig[status];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A]">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-5xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left info */}
          <section className="space-y-5">
            <span className={`inline-flex rounded-full border px-4 py-1 text-sm font-medium ${cfg.badgeClass}`}>
              {cfg.badge}
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <Zap size={15} className="text-white" fill="white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-lg">
                Money<span className="text-amber-500">Manager</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-snug">
              Xác thực email an toàn cho tài khoản của bạn.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Trang này hoàn tất bước kích hoạt tài khoản sau khi bạn bấm vào liên kết trong email,
              rồi hướng bạn quay lại ứng dụng với trạng thái thật rõ ràng.
            </p>
          </section>

          {/* Right card */}
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${cfg.iconBg}`}>
                {cfg.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{cfg.badge}</p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{cfg.title}</h2>
              </div>
            </div>

            <p className={`rounded-xl border px-4 py-4 text-sm leading-6 ${cfg.msgClass}`}>
              {message}
            </p>

            <div className="mt-6 space-y-3">
              {status === "success" && (
                <Link className="btn-primary block text-center" to="/login">
                  Đi tới đăng nhập
                </Link>
              )}
              <Link
                className="block rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-center text-sm font-medium
                  text-slate-700 dark:text-slate-300 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                to="/signup"
              >
                Quay lại đăng ký
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountActivation;
