import { useState } from "react";
import { LoaderCircle, ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Input from "../components/Input.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { validateEmail } from "../util/validation.js";

const ForgotPassword = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-md items-center justify-center px-6 py-16">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <div className="bg-white/90 p-8">
            <div className="mb-6">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-blue-600"
              >
                <ArrowLeft size={18} />
                Quay lại đăng nhập
              </button>
            </div>

            <div className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold">Quên mật khẩu?</h2>
              <p className="text-sm text-slate-500">
                Nhập email của bạn để nhận link đặt lại mật khẩu
              </p>
            </div>

            {!success ? (
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <Input
                  label="Địa chỉ email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tenban@example.com"
                  type="email"
                  value={email}
                  autoFocus
                />

                {error ? (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <button
                  className="btn-primary flex w-full items-center justify-center gap-2"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi link đặt lại mật khẩu"
                  )}
                </button>

                <p className="text-center text-sm text-slate-600">
                  Chưa có tài khoản?{" "}
                  <Link
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                    to="/signup"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </form>
            ) : (
              <div className="mt-8 space-y-5 text-center">
                <div className="rounded-xl bg-green-50 p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-green-800">
                    Email đã được gửi!
                  </h3>
                  <p className="text-sm text-green-700">
                    Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
                    <strong>{email}</strong>
                  </p>
                  <p className="mt-2 text-xs text-green-600">
                    Vui lòng kiểm tra hộp thư (cả spam) và làm theo hướng dẫn.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;