export const PAYMENT_STATUS_META = {
  PAID: { label: "Đã thanh toán", tone: "success", icon: "checkmark-circle-outline" },
  PENDING: { label: "Chờ thanh toán", tone: "warning", icon: "time-outline" },
  PROCESSING: { label: "Đang xử lý", tone: "info", icon: "sync-outline" },
  FAILED: { label: "Thất bại", tone: "danger", icon: "alert-circle-outline" },
  CANCELLED: { label: "Đã hủy", tone: "muted", icon: "close-circle-outline" },
  CANCELED: { label: "Đã hủy", tone: "muted", icon: "close-circle-outline" },
  EXPIRED: { label: "Đã hết hạn", tone: "muted", icon: "close-circle-outline" },
  UNDERPAID: { label: "Chưa đủ tiền", tone: "warning", icon: "alert-circle-outline" }
};

export function normalizePaymentStatus(status = "") {
  return String(status || "PENDING").trim().toUpperCase() || "PENDING";
}

export function getPaymentStatusMeta(status = "") {
  const normalizedStatus = normalizePaymentStatus(status);
  return PAYMENT_STATUS_META[normalizedStatus] || {
    label: normalizedStatus,
    tone: "muted",
    icon: "help-circle-outline"
  };
}

export function canSyncPaymentStatus(status = "") {
  return normalizePaymentStatus(status) !== "PAID";
}

export function formatPaymentDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
