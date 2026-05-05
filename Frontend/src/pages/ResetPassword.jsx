import { useState, useEffect } from "react";
import { LoaderCircle, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import Input from "../components/Input.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false, uppercase: false, lowercase: false, number: false, specialChar: false,
  });

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setError("Token không hợp lệ hoặc đã hết hạn");
    }
  }, [token]);

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    checkPasswordStrength(password);
  };

  const validatePassword = () => {
    if (newPassword.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!/[A-Z]/.test(newPassword)) return "Mật khẩu phải có ít nhất 1 chữ hoa";
    if (!/[a-z]/.test(newPassword)) return "Mật khẩu phải có ít nhất 1 chữ thường";
    if (!/[0-9]/.test(newPassword)) return "Mật khẩu phải có ít nhất 1 số";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const passwordError = validatePassword();
    if (passwordError) { setError(passwordError); setIsLoading(false); return; }
    if (newPassword !== confirmPassword) { setError("Mật khẩu xác nhận không khớp"); setIsLoading(false); return; }

    try {
      await axiosConfig.post(API_ENDPOINTS.RESET_PASSWORD, { token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const cardClass = "w-full rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0F172A] p-8 text-center";

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A]">
        <Header />
        <main className="mx-auto flex max-w-md items-center justify-center px-6 py-16">
          <div className={cardClass}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
              <XCircle size={26} className="text-red-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-red-500">Link không hợp lệ</h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              {error || "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}
            </p>
            <button onClick={() => navigate("/forgot-password")} className="btn-primary">
              Gửi lại yêu cầu
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A]">
        <Header />
        <main className="mx-auto flex max-w-md items-center justify-center px-6 py-16">
          <div className={cardClass}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle size={26} className="text-emerald-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-emerald-500">Thành công!</h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Mật khẩu đã được thay đổi. Bạn có thể đăng nhập ngay.
            </p>
            <button onClick={() => navigate("/login")} className="btn-primary">
              Đăng nhập ngay
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A]">
      <Header />
      <main className="mx-auto flex max-w-md items-center justify-center px-6 py-16">
        <div className="w-full rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0F172A]">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đặt lại mật khẩu</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Vui lòng nhập mật khẩu mới cho tài khoản
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[calc(50%+2px)] -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {newPassword && (
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Yêu cầu mật khẩu:</p>
                  {[
                    [passwordStrength.length, "Ít nhất 8 ký tự"],
                    [passwordStrength.uppercase, "1 chữ hoa"],
                    [passwordStrength.lowercase, "1 chữ thường"],
                    [passwordStrength.number, "1 số"],
                    [passwordStrength.specialChar, "1 ký tự đặc biệt"],
                  ].map(([ok, label]) => (
                    <p key={label} className={`text-xs ${ok ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"}`}>
                      {ok ? "✓" : "○"} {label}
                    </p>
                  ))}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Input
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[calc(50%+2px)] -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              )}

              <button className="btn-primary flex w-full items-center justify-center gap-2" disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Đang đặt lại...
                  </>
                ) : "Đặt lại mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
