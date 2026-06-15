import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import favicon from "../assets/logo/favicon.png";
import { useTranslation } from "../hooks/useTranslation.js";

const AccountActivation = () => {
  const { t } = useTranslation();
  usePageTitle(t("auth.activationTitle"));
  const navigate = useNavigate();
  const location = useLocation();

  // Email may come from Signup navigation state or be entered manually
  const [email, setEmail] = useState(location.state?.email || "");
  const [emailInput, setEmailInput] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown ticker
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError(t("auth.emailRequired")); return; }
    if (otp.trim().length !== 6) { setError(t("auth.invalidOtpLength")); return; }

    setIsVerifying(true);
    try {
      await axiosConfig.post(API_ENDPOINTS.VERIFY_ACTIVATION, {
        email: email.trim(),
        otp: otp.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || t("auth.activationFailed"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    if (!email.trim()) { setError(t("auth.emailRequiredFirst")); return; }
    setError("");
    setIsResending(true);
    try {
      await axiosConfig.post(API_ENDPOINTS.OTP_RESEND, { email: email.trim() });
      setCountdown(180);
    } catch (err) {
      const retryAfter = err.response?.data?.retryAfterSeconds;
      if (retryAfter) {
        setCountdown(Number(retryAfter));
      } else {
        setError(err.response?.data?.message || t("auth.resendLaterFailed"));
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setEmail(emailInput.trim());
    setError("");
    setOtp("");
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A]">
        <Header />
        <main className="mx-auto flex max-w-md items-center justify-center px-6 py-16 min-h-[calc(100vh-65px)]">
          <div className="w-full rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-2xl bg-white dark:bg-[#0F172A] p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("auth.activationSuccessTitle")}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
              {t("auth.activationSuccessDescription")}
            </p>
            <button onClick={() => navigate("/login")} className="btn-primary w-full">
              {t("nav.login")}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] flex flex-col">
      <Header />
      <main className="mx-auto flex max-w-5xl items-center px-6 py-12 flex-1">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left info */}
          <section className="space-y-5">
            <div className="flex items-center justify-center gap-2 mb-3 lg:justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                <img src={favicon} alt="Money Manager Logo" className="w-12 h-12 max-w-none object-cover scale-110" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Money<span className="text-amber-500">Manager</span></span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-snug">
              {t("auth.activationHeroTitle")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              {t("auth.activationHeroDescription")}{" "}
              <strong className="text-slate-700 dark:text-slate-300">200 {t("auth.seconds")}</strong>.
            </p>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <ShieldCheck size={15} className="mt-0.5 text-amber-500 shrink-0" />
                <span>{t("auth.otpEncrypted")}</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={15} className="mt-0.5 text-amber-500 shrink-0" />
                <span>{t("auth.otpDoNotShare")}</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={15} className="mt-0.5 text-amber-500 shrink-0" />
                <span>{t("auth.otpFailedLimit")}</span>
              </div>
            </div>
          </section>

          {/* Right card */}
          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] p-8 shadow-2xl">

            {/* If no email yet, show email input */}
            {!email ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t("auth.activationTitle")}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t("auth.activationEmailInstruction")}</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("auth.emailShort")}</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={t("auth.emailPlaceholder")}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary w-full">{t("common.continue")}</button>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  {t("auth.noAccount")}{" "}
                  <Link to="/signup" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                    {t("nav.signup")}
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t("auth.enterOtp")}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("auth.otpSentTo")} <strong className="text-slate-700 dark:text-slate-300">{email}</strong>.{" "}
                    <button
                      type="button"
                      onClick={() => { setEmail(""); setEmailInput(""); setOtp(""); setError(""); }}
                      className="text-amber-600 dark:text-amber-400 hover:underline text-xs"
                    >
                      {t("auth.changeEmail")}
                    </button>
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("auth.otpLabel")}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-slate-900 dark:text-white placeholder-slate-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  className="btn-primary flex w-full items-center justify-center gap-2"
                  disabled={isVerifying}
                  type="submit"
                >
                  {isVerifying ? <><LoaderCircle className="animate-spin" size={18} /> {t("auth.verifying")}</> : t("auth.activationTitle")}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || isResending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending
                    ? <><LoaderCircle className="animate-spin" size={15} /> {t("auth.sending")}</>
                    : countdown > 0
                      ? <><RefreshCw size={15} /> {t("auth.resendIn")} {countdown}s</>
                      : <><RefreshCw size={15} /> {t("auth.resendOtp")}</>
                  }
                </button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                  <Link to="/signup" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                    {t("auth.backToSignup")}
                  </Link>
                </p>
              </form>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountActivation;
