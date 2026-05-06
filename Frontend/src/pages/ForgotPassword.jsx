import { useState } from "react";
import { LoaderCircle, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Input from "../components/Input.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { validateEmail } from "../util/validation.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import Footer from "../components/Footer.jsx";

const ForgotPassword = () => {
  const navigate = useNavigate();
  usePageTitle("Quên mật khẩu");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (!validateEmail(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ");
      setIsLoading(false);
      return;
    }

    try {
      await axiosConfig.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] flex flex-col">
      <Header />
      <main className="mx-auto flex max-w-md items-center justify-center px-6 py-16 flex-1">
        <div className="w-full rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0F172A]">
          <div className="p-8">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400
                hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Quay lại đăng nhập
            </button>

            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl
                bg-amber-500/10 border border-amber-500/20">
                <Mail size={24} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quên mật khẩu?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Nhập email để nhận link đặt lại mật khẩu
              </p>
            </div>

            {!success ? (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  label="Địa chỉ email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tenban@example.com"
                  type="email"
                  value={email}
                  autoFocus
                />

                {error && (
                  <p className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button className="btn-primary flex w-full items-center justify-center gap-2" disabled={isLoading} type="submit">
                  {isLoading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      Đang gửi...
                    </>
                  ) : "Gửi link đặt lại mật khẩu"}
                </button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Chưa có tài khoản?{" "}
                  <Link className="font-semibold text-amber-600 dark:text-amber-400 hover:underline" to="/signup">
                    Đăng ký ngay
                  </Link>
                </p>
              </form>
            ) : (
              <div className="space-y-5 text-center">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                    <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-emerald-800 dark:text-emerald-400">
                    Email đã được gửi!
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>
                  </p>
                  <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                    Vui lòng kiểm tra hộp thư (cả spam).
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="btn-primary"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
