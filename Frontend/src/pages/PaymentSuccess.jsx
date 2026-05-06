import { useContext, useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarClock, CreditCard, Hash, House } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { AppContext } from "../context/AppContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import Footer from "../components/Footer.jsx";

const PAYMENT_STORAGE_KEY = "latestPayment";

const PAYMENT_STATUS_LABELS = {
  PAID: "Đã thanh toán thành công",
  PENDING: "Đang chờ thanh toán",
  PROCESSING: "Đang xử lý",
  FAILED: "Thanh toán thất bại",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
  UNDERPAID: "Thanh toán chưa đủ",
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  usePageTitle("Thanh toán thành công");
  const { setUser } = useContext(AppContext);
  const [payment, setPayment] = useState(null);
  const [arrivedAt] = useState(() => new Date().toISOString());

  const orderCode = useMemo(() => {
    const savedPayment = JSON.parse(localStorage.getItem(PAYMENT_STORAGE_KEY) || "null");
    return searchParams.get("orderCode") || savedPayment?.orderCode || "";
  }, [searchParams]);

  const returnStatus = (searchParams.get("status") || "").toUpperCase();
  const transactionIdFromUrl = searchParams.get("id");

  useEffect(() => {
    const syncPaymentAndProfile = async () => {
      const savedPayment = localStorage.getItem(PAYMENT_STORAGE_KEY);
      const parsedSavedPayment = savedPayment ? JSON.parse(savedPayment) : null;
      const nextPayment = {
        ...parsedSavedPayment,
        orderCode: searchParams.get("orderCode") || parsedSavedPayment?.orderCode || "",
        paymentLinkId: transactionIdFromUrl || parsedSavedPayment?.paymentLinkId || "",
        status: returnStatus === "PAID" ? "PAID" : parsedSavedPayment?.status || "PENDING",
      };
      setPayment(nextPayment);
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(nextPayment));
      if (!nextPayment.orderCode) return;
      try {
        const paymentResponse = await axiosConfig.get(API_ENDPOINTS.SYNC_PAYMENT_STATUS(nextPayment.orderCode));
        const mergedPayment = { ...nextPayment, ...paymentResponse.data, status: returnStatus === "PAID" ? "PAID" : paymentResponse.data.status };
        setPayment(mergedPayment);
        localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(mergedPayment));
        const profileResponse = await axiosConfig.get(API_ENDPOINTS.GET_USER_INFO);
        setUser(profileResponse.data);
      } catch (error) {
        console.error("Không thể đồng bộ trạng thái thanh toán thành công", error);
      }
    };
    syncPaymentAndProfile();
  }, [orderCode, returnStatus, searchParams, setUser, transactionIdFromUrl]);

  const displayStatus = returnStatus === "PAID" ? "PAID" : payment?.status || "PENDING";
  const isPaid = displayStatus === "PAID";
  const transactionId = transactionIdFromUrl || payment?.paymentLinkId || "--";
  const amount = payment?.amount;
  const description = payment?.description || "Thanh toán PayOS";
  const displayedTime = payment?.updatedAt || payment?.createdAt || arrivedAt;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E1A] px-6 py-12 flex flex-col">
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 dark:border-emerald-500/20
        bg-white dark:bg-[#0F172A] p-8 shadow-2xl shadow-emerald-100/40 dark:shadow-black/40 flex-1">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl
          bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-6">
          <BadgeCheck size={28} />
        </div>

        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Thanh toán thành công</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Giao dịch của bạn đã được ghi nhận thành công.</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bạn có thể xem lại chi tiết đơn hàng ở bên dưới.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden mb-6">
          <div className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Trạng thái thanh toán</p>
                <p className={`mt-1 text-lg font-bold ${isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                  {PAYMENT_STATUS_LABELS[displayStatus] || displayStatus}
                </p>
              </div>
              <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${isPaid ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-slate-900 dark:bg-white/10 text-white"}`}>
                {PAYMENT_STATUS_LABELS[displayStatus] || displayStatus}
              </span>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <DetailCard icon={Hash} label="Mã đơn hàng" value={payment?.orderCode || orderCode || "--"} />
            <DetailCard icon={CreditCard} label="Mã giao dịch" value={transactionId} />
            <DetailCard icon={BadgeCheck} label="Số tiền" value={amount ? `${Number(amount).toLocaleString("vi-VN")} VND` : "--"} />
            <DetailCard icon={CalendarClock} label="Thời gian" value={formatDateTime(displayedTime)} />
          </div>

          <div className="px-5 pb-5">
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 px-4 py-3">
              <p className="text-xs text-slate-400 mb-0.5">Nội dung thanh toán</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition-all active:scale-95"
            to="/dashboard"
          >
            <House size={15} />Về trang chủ
          </Link>
          <Link
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
            to="/payment"
          >
            Quay lại thanh toán<ArrowRight size={15} />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 px-4 py-3">
    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
      <Icon size={14} /><span>{label}</span>
    </div>
    <p className="text-sm font-semibold text-slate-900 dark:text-white break-all">{value}</p>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "medium" }).format(date);
};

export default PaymentSuccess;
