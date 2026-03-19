import { ArrowLeft, CircleAlert, RefreshCcw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

const PAYMENT_STORAGE_KEY = "latestPayment";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const [isSyncing, setIsSyncing] = useState(false);

  const orderCode = useMemo(() => {
    return searchParams.get("orderCode") || JSON.parse(localStorage.getItem(PAYMENT_STORAGE_KEY) || "null")?.orderCode || "";
  }, [searchParams]);

  const handleSyncStatus = async () => {
    if (!orderCode) {
      toast.error("Order code not found");
      return;
    }

    setIsSyncing(true);

    try {
      const response = await axiosConfig.get(API_ENDPOINTS.SYNC_PAYMENT_STATUS(orderCode));
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(response.data));
      toast.success(`Latest payment status: ${response.data.status}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to sync payment status");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.12),transparent_30%),linear-gradient(180deg,#fff7ed_0%,#fff1f2_100%)] px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-rose-200 bg-white p-8 shadow-xl shadow-rose-100/60">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <CircleAlert size={30} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-rose-600">Payment Cancelled</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">The checkout was cancelled or not completed.</h1>
          <p className="mt-3 text-slate-600">
            You can return to the payment page to create a new link, or refresh the current order status in case the payment was completed in another tab.
          </p>
        </div>

        <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
          <p>Order code: <span className="font-semibold text-slate-900">{orderCode || "--"}</span></p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!orderCode || isSyncing}
            onClick={handleSyncStatus}
            type="button"
          >
            <RefreshCcw size={16} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Checking..." : "Check payment status"}
          </button>

          <Link
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            to="/payment"
          >
            <ArrowLeft size={16} />
            Back to payment page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
