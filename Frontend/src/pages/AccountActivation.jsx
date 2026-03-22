import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle, MailWarning, TriangleAlert } from "lucide-react";
import Header from "../components/Header.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

const AccountActivation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("We are confirming your account now.");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("missing-token");
      setMessage("This activation link is incomplete. Please use the latest link from your email.");
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
        setMessage(response.data || "Your account has been activated successfully.");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setStatus("error");
        setMessage(
          error.response?.data || "This activation link is invalid, expired, or has already been used."
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
      badge: "Activating Account",
      title: "Checking your verification link",
      description: message,
      accent: "border-slate-200 bg-slate-50 text-slate-700"
    },
    success: {
      icon: <CheckCircle2 className="text-emerald-600" size={30} />,
      badge: "Activation Complete",
      title: "Your account is ready",
      description: message,
      accent: "border-emerald-200 bg-emerald-50 text-emerald-700"
    },
    error: {
      icon: <TriangleAlert className="text-amber-600" size={30} />,
      badge: "Activation Failed",
      title: "We could not activate this account",
      description: message,
      accent: "border-amber-200 bg-amber-50 text-amber-700"
    },
    "missing-token": {
      icon: <MailWarning className="text-sky-600" size={30} />,
      badge: "Invalid Link",
      title: "This verification link is missing information",
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
              Secure email verification for your Money Manager account.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              This page completes the account activation flow after the user clicks the email link
              sent through Brevo, then guides them back into the app with a clear success or error state.
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
                  Go to Login
                </Link>
              ) : null}

              <Link
                className="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                to="/signup"
              >
                Back to Signup
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountActivation;
