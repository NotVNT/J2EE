export const DEFAULT_PAYMENT_PLANS = [
  {
    id: "basic",
    subscriptionPlan: "BASIC",
    displayName: "Gói Cơ Bản",
    amount: 2000,
    description: "Gói dành cho người dùng mới",
    badge: "Phổ biến",
    cycleLabel: "1 tháng",
    cycleMonths: 1,
    icon: "ShieldCheck",
    accent: "from-slate-900 via-slate-800 to-slate-700",
    features: [
      "Theo dõi giao dịch hằng ngày",
      "Báo cáo thu chi cơ bản",
      "Nhắc nhở thanh toán định kỳ"
    ]
  },
  {
    id: "premium",
    subscriptionPlan: "PREMIUM",
    displayName: "Gói Premium",
    amount: 299000,
    description: "Gói mở rộng với nhiều tính năng nâng cao",
    badge: "Nâng cao",
    cycleLabel: "12 tháng",
    cycleMonths: 12,
    icon: "Sparkles",
    accent: "from-amber-500 via-orange-500 to-rose-500",
    features: [
      "Không giới hạn lịch sử giao dịch",
      "Biểu đồ và báo cáo chuyên sâu",
      "Import hóa đơn bằng ảnh để tự động tạo chi tiêu",
      "Ưu tiên đồng bộ trạng thái thanh toán"
    ]
  }
];

export const getPaymentPlans = () => {
  const saved = localStorage.getItem("payment_plans");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Không thể tải danh sách gói dịch vụ", e);
    }
  }
  return DEFAULT_PAYMENT_PLANS;
};

export const savePaymentPlans = (plans) => {
  localStorage.setItem("payment_plans", JSON.stringify(plans));
};
