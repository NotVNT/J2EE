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
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
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
    if (newPassword.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!/[A-Z]/.test(newPassword)) {
      return "Mật khẩu phải có ít nhất 1 chữ hoa";
    }
    if (!/[a-z]/.test(newPassword)) {
      return "Mật khẩu phải có ít nhất 1 chữ thường";
    }
    if (!/[0-9]/.test(newPassword)) {
      return "Mật khẩu phải có ít nhất 1 số";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setIsLoading(false);
      return;
    }

    try {
      await axiosConfig.post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto flex max-w-md items-center justify-center px-6 py-16">
          <div className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <div className="bg-white/90 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-red-600">
                Link không hợp lệ
              </h2>
              <p className="mb-6 text-sm text-slate-600">
                {error || "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}
              </p>
              <button
                onClick={() => navigate("/forgot-password")}
                className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Gửi lại yêu cầu
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto flex max-w-md items-center justify-center px-6 py-16">
          <div className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <div className="bg-white/90 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-green-600">
                Đặt lại mật khẩu thành công!
              </h2>
              <p className="mb-6 text-sm text-slate-600">
                Mật khẩu của bạn đã được thay đổi. Bạn có thể đăng nhập ngay bây giờ.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-md items-center justify-center px-6 py-16">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <div className="bg-white/90 p-8">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Đặt lại mật khẩu</h2>
              <p className="text-sm text-slate-500">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-600">
                    Yêu cầu mật khẩu:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li className={passwordStrength.length ? "text-green-600" : "text-slate-400"}>
                      ✓ {passwordStrength.length ? "Đủ" : "Cần"} ít nhất 8 ký tự
                    </li>
                    <li className={passwordStrength.uppercase ? "text-green-600" : "text-slate-400"}>
                      ✓ {passwordStrength.uppercase ? "Có" : "Cần"} ít nhất 1 chữ hoa
                    </li>
                    <li className={passwordStrength.lowercase ? "text-green-600" : "text-slate-400"}>
                      ✓ {passwordStrength.lowercase ? "Có" : "Cần"} ít nhất 1 chữ thường
                    </li>
                    <li className={passwordStrength.number ? "text-green-600" : "text-slate-400"}>
                      ✓ {passwordStrength.number ? "Có" : "Cần"} ít nhất 1 số
                    </li>
                    <li className={passwordStrength.specialChar ? "text-green-600" : "text-slate-400"}>
                      ✓ {passwordStrength.specialChar ? "Có" : "Cần"} ít nhất 1 ký tự đặc biệt
                    </li>
                  </ul>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Input
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

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
                    Đang đặt lại mật khẩu...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;