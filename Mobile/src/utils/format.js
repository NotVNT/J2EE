export const formatMoney = (value = 0) => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  } catch {
    return `${value} VND`;
  }
};

export const normalizeCurrencyInput = (value = "") => {
  return String(value || "").replace(/[^\d]/g, "");
};

export const formatCurrencyInput = (value = "") => {
  const digits = normalizeCurrencyInput(value);
  if (!digits) {
    return "";
  }

  try {
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0
    }).format(Number(digits));
  } catch {
    return digits;
  }
};

export const parseCurrencyInput = (value = "") => {
  const digits = normalizeCurrencyInput(value);
  if (!digits) {
    return 0;
  }

  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : 0;
};

export const getApiErrorMessage = (error, fallback = "Đã có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};

export const todayIso = () => new Date().toISOString().split("T")[0];

export const formatDate = (value) => {
  if (!value) return "-";

  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("vi-VN").format(date);
  } catch {
    return String(value);
  }
};

export const formatPercent = (value = 0) => {
  const normalized = Number(value || 0);
  if (!Number.isFinite(normalized)) {
    return "0%";
  }

  return `${normalized.toFixed(1)}%`;
};
