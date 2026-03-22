export const DEFAULT_PAYMENT_PLANS = [
  {
    id: "basic",
    subscriptionPlan: "BASIC",
    displayName: "Goi Co Ban",
    amount: 2000,
    description: "Goi cho nguoi dung moi",
    badge: "Pho bien",
    cycleLabel: "1 thang",
    cycleMonths: 1,
    icon: "ShieldCheck",
    accent: "from-slate-900 via-slate-800 to-slate-700",
    features: [
      "Theo doi giao dich hang ngay",
      "Bao cao thu chi co ban",
      "Nhac nho thanh toan dinh ky"
    ]
  },
  {
    id: "premium",
    subscriptionPlan: "PREMIUM",
    displayName: "Goi Premium",
    amount: 299000,
    description: "Goi mo rong tinh nang nang cao",
    badge: "Nang cao",
    cycleLabel: "12 thang",
    cycleMonths: 12,
    icon: "Sparkles",
    accent: "from-amber-500 via-orange-500 to-rose-500",
    features: [
      "Khong gioi han lich su giao dich",
      "Bieu do va bao cao chuyen sau",
      "Uu tien dong bo trang thai thanh toan"
    ]
  }
];

export const getPaymentPlans = () => {
  const saved = localStorage.getItem("payment_plans");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load plans", e);
    }
  }
  return DEFAULT_PAYMENT_PLANS;
};

export const savePaymentPlans = (plans) => {
  localStorage.setItem("payment_plans", JSON.stringify(plans));
};
