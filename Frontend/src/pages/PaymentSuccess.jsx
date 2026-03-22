import { useContext, useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarClock, CreditCard, Hash, House } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { AppContext } from "../context/AppContext.jsx";

const PAYMENT_STORAGE_KEY = "latestPayment";

const PAYMENT_STATUS_LABELS = {
  PAID: "Đã thanh toán thành công",
  PENDING: "Đang chờ thanh toán",
  PROCESSING: "Đang xử lý",
  FAILED: "Thanh toán thất bại",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
  UNDERPAID: "Thanh toán chưa đủ"
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
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
        status: returnStatus === "PAID" ? "PAID" : parsedSavedPayment?.status || "PENDING"
      };

      setPayment(nextPayment);
      localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(nextPayment));

      if (!nextPayment.orderCode) {
        return;
      }

      try {
        const paymentResponse = await axiosConfig.get(API_ENDPOINTS.SYNC_PAYMENT_STATUS(nextPayment.orderCode));
        const mergedPayment = {
          ...nextPayment,
          ...paymentResponse.data,
          status: returnStatus === "PAID" ? "PAID" : paymentResponse.data.status
        };

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)] px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-emerald-200 bg-white p-8 shadow-xl shadow-emerald-100/60">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <BadgeCheck size={30} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-600">Thanh toán thành công</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Giao dịch của bạn đã được ghi nhận thành công.</h1>
          <p className="mt-3 text-slate-600">Bạn có thể xem lại chi tiết đơn hàng ở bên dưới.</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
          <div className="border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Trạng thái thanh toán</p>
                <p className={`mt-1 text-xl font-semibold ${isPaid ? "text-emerald-700" : "text-slate-900"}`}>
                  {PAYMENT_STATUS_LABELS[displayStatus] || displayStatus}
                </p>
              </div>
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-slate-900 text-white"}`}>
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
            <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-700">
              <p className="text-slate-500">Nội dung thanh toán</p>
              <p className="mt-1 font-medium text-slate-900">{description}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            to="/dashboard"
          >
            <House size={16} />
            Về trang chủ
          </Link>

          <Link
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            to="/payment"
          >
            Quay lại thanh toán
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl bg-white px-4 py-4">
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Icon size={16} />
      <span>{label}</span>
    </div>
    <p className="mt-2 break-words text-base font-semibold text-slate-900">{value}</p>
  </div>
);

const formatDateTime = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(date);
};

export default PaymentSuccess;
