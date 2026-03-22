import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle, MailWarning, TriangleAlert } from "lucide-react";
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
        if (!isMounted) {
          return;
        }
        setStatus("success");
        setMessage(response.data || "Tài khoản của bạn đã được kích hoạt thành công.");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setStatus("error");
        setMessage(
          error.response?.data || "Liên kết kích hoạt không hợp lệ, đã hết hạn hoặc đã được sử dụng."
        );
      }
    };

    activateAccount();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const statusConfig = {
    loading: {
      icon: <LoaderCircle className="animate-spin text-slate-700" size={30} />,
      badge: "Đang kích hoạt",
      title: "Đang kiểm tra liên kết xác thực",
      description: message,
      accent: "border-slate-200 bg-slate-50 text-slate-700"
    },
    success: {
      icon: <CheckCircle2 className="text-emerald-600" size={30} />,
      badge: "Kích hoạt thành công",
      title: "Tài khoản của bạn đã sẵn sàng",
      description: message,
      accent: "border-emerald-200 bg-emerald-50 text-emerald-700"
    },
    error: {
      icon: <TriangleAlert className="text-amber-600" size={30} />,
      badge: "Kích hoạt thất bại",
      title: "Chúng tôi không thể kích hoạt tài khoản này",
      description: message,
      accent: "border-amber-200 bg-amber-50 text-amber-700"
    },
    "missing-token": {
      icon: <MailWarning className="text-sky-600" size={30} />,
      badge: "Liên kết không hợp lệ",
      title: "Liên kết xác thực đang thiếu thông tin",
      description: message,
      accent: "border-sky-200 bg-sky-50 text-sky-700"
    }
  };

  const currentState = statusConfig[status];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <span className={`inline-flex rounded-full border px-4 py-1 text-sm font-medium ${currentState.accent}`}>
              {currentState.badge}
            </span>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
              Xác thực email an toàn cho tài khoản Money Manager của bạn.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Trang này hoàn tất bước kích hoạt tài khoản sau khi người dùng bấm vào liên kết trong email,
              rồi hướng họ quay lại ứng dụng với trạng thái thành công hoặc lỗi thật rõ ràng.
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                {currentState.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{currentState.badge}</p>
                <h2 className="text-2xl font-semibold text-slate-900">{currentState.title}</h2>
              </div>
            </div>

            <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
              {currentState.description}
            </p>

            <div className="mt-8 space-y-3">
              {status === "success" ? (
                <Link className="btn-primary block text-center" to="/login">
                  Đi tới đăng nhập
                </Link>
              ) : null}

              <Link
                className="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
