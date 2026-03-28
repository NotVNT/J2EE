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

export const getApiErrorMessage = (error, fallback = "Đã có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};
