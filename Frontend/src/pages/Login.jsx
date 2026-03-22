import { useContext, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import Input from "../components/Input.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS, BASE_URL } from "../util/apiEndpoints.js";
import { validateEmail } from "../util/validation.js";
import loginImage from "../assets/login.jpeg";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };
  const handleGoogleLogin = () => {
    const normalizedBaseUrl = BASE_URL.replace(/\/api\/v1\.0\/?$/, "");
    const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL || `${normalizedBaseUrl}/oauth2/authorization/google`;
    window.location.href = googleAuthUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateEmail(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ");
      setIsLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.LOGIN, { email, password });
      const { token, user } = response.data;
      if (token) {
        if (rememberMe) {
          localStorage.setItem("token", token);
          sessionStorage.removeItem("token");
          localStorage.setItem("rememberedEmail", email.trim());
        } else {
          sessionStorage.setItem("token", token);
          localStorage.removeItem("token");
          localStorage.removeItem("rememberedEmail");
        }
        setUser(user);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-5xl items-center justify-center px-6 py-16">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-200/70 backdrop-blur md:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden md:block">
            <img alt="Hình minh họa đăng nhập" className="h-full w-full object-cover" src={loginImage} />
          </section>

          <section className="bg-white/90 p-8 md:p-10">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Chào mừng bạn quay lại</h2>
              <p className="text-sm text-slate-500">Vui lòng nhập thông tin để đăng nhập.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Địa chỉ email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tenban@example.com"
                type="text"
                value={email}
              />
              <Input
                label="Mật khẩu"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                type="password"
                value={password}
              />

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input
                    checked={rememberMe}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    onChange={(event) => setRememberMe(event.target.checked)}
                    type="checkbox"
                  />
                  Ghi nhớ đăng nhập
                </label>

                <button
                  className="font-medium text-blue-600 transition hover:text-blue-700"
                  onClick={handleForgotPassword}
                  type="button"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              ) : null}

              <button className="btn-primary flex items-center justify-center gap-2" disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Đang đăng nhập...
                  </>
                ) : (
                  "ĐĂNG NHẬP"
                )}
              </button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs uppercase tracking-wide text-slate-400">hoặc</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={handleGoogleLogin}
                type="button"
              >
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M21.35 11.1H12v2.98h5.35c-.23 1.44-1.78 4.23-5.35 4.23-3.22 0-5.85-2.67-5.85-5.96 0-3.3 2.63-5.96 5.85-5.96 1.83 0 3.05.79 3.75 1.47l2.56-2.5C16.65 3.83 14.52 3 12 3 7.03 3 3 7.06 3 12.05c0 4.98 4.03 9.05 9 9.05 5.19 0 8.62-3.7 8.62-8.9 0-.6-.07-1.04-.27-1.1Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M6.6 14.28 5.9 16.91 3.32 16.97A9.12 9.12 0 0 1 3 12.05c0-1.56.38-3.03 1.04-4.3h.01l2.3.43 1.01 2.31a5.7 5.7 0 0 0-.76 2.79c0 .35.03.69.1 1.01Z"
                    fill="#34A853"
                  />
                  <path
                    d="m20.62 12.2-.27 1.22c-.92 4.42-4.06 7.67-8.35 7.67-3.49 0-6.5-2-7.95-4.92l3.28-2.69a5.38 5.38 0 0 0 4.67 2.82c2.2 0 4.03-1.49 4.7-3.58H12V12.2h8.62Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M20.35 6.63 17.35 9.3A5.14 5.14 0 0 0 12 6.03c-2.2 0-4.05 1.52-4.71 3.65L4.03 7.75A9.04 9.04 0 0 1 12 3c2.52 0 4.65.83 6.35 2.4Z"
                    fill="#EA4335"
                  />
                </svg>
                Đăng nhập bằng Google
              </button>

              <p className="text-center text-sm text-slate-600">
                Bạn chưa có tài khoản?{" "}
                <Link
                  className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800"
                  to="/signup"
                >
                  Đăng ký
                </Link>
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Login;
