import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import { LoaderCircle, Zap } from "lucide-react";
import Header from "../components/Header.jsx";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã OTP.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await axiosConfig.post(API_ENDPOINTS.VERIFY_OTP, {
        email,
        otpCode,
      });
      toast.success("Xác thực tài khoản thành công!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setCountdown(60);
    setError(null);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    try {
      await axiosConfig.post(API_ENDPOINTS.RESEND_OTP, { email });
      toast.success("Mã OTP đã được gửi lại.");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 via-red-900 to-[#0A0E1A]">
      <Header />
      <main className="mx-auto flex max-w-lg items-start justify-center px-6 py-10">
        <div className="w-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden
          bg-white/10 backdrop-blur-lg">

          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-center gap-2.5 mb-6">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <span className="font-bold text-white">
                Money<span className="text-amber-500">Manager</span>
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-2">Check your email</h2>
            <p className="text-sm text-gray-300 text-center mb-1">
              Please enter the code sent to
            </p>
            <p className="text-sm font-semibold text-white text-center mb-8">
              {email}
            </p>

            <form onSubmit={handleSubmit}>
              {/* OTP Inputs */}
              <div className="flex justify-center gap-3 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-bold text-white bg-white/10 border border-white/20 rounded-xl
                      focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-all
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ))}
              </div>

              {error && (
                <p className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-200 text-center mb-6">
                  {error}
                </p>
              )}

              <button
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600
                  hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2
                  ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="animate-spin w-5 h-5" />
                    Đang xác thực...
                  </>
                ) : "XÁC THỰC"}
              </button>
            </form>

            <p className="text-sm text-gray-400 text-center mt-6">
              Didn't receive a code?{" "}
              <button
                onClick={handleResend}
                disabled={resendDisabled}
                className="font-semibold text-amber-400 hover:text-amber-300 hover:underline disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
              >
                {resendDisabled ? `Gửi lại sau ${countdown}s` : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOtp;
