import { useContext, useEffect, useMemo, useState } from "react";
import { BadgeCheck, CreditCard, House, Settings2, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Dashboard from "../components/Dashboard.jsx";
import { AppContext } from "../context/AppContext.jsx";
import { useUser } from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";

const PAYMENT_STORAGE_KEY = "latestPayment";
const PAYMENT_PLANS = [
  {
    id: "basic",
    subscriptionPlan: "BASIC",
    displayName: "Goi Co Ban",
    amount: 2000,
    description: "Goi Co Ban",
    badge: "Pho bien",
    cycleLabel: "1 thang",
    cycleMonths: 1,
    icon: ShieldCheck,
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
    description: "Goi Premium",
    badge: "Nang cao",
    cycleLabel: "12 thang",
    cycleMonths: 12,
    icon: Sparkles,
    accent: "from-amber-500 via-orange-500 to-rose-500",
    features: [
      "Khong gioi han lich su giao dich",
      "Bieu do va bao cao chuyen sau",
      "Uu tien dong bo trang thai thanh toan"
    ]
  }
];

const Payment = () => {
  useUser();

  const { user, setUser } = useContext(AppContext);
  const [selectedPlanId, setSelectedPlanId] = useState(PAYMENT_PLANS[0].id);
  const [latestPayment, setLatestPayment] = useState(null);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [showManagePanel, setShowManagePanel] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const savedPayment = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (!savedPayment) {
      return;
    }

    try {
      const parsedPayment = JSON.parse(savedPayment);
      setLatestPayment(parsedPayment);
      setAutoRenew(Boolean(parsedPayment.autoRenew));
      if (parsedPayment.planId) {
        setSelectedPlanId(parsedPayment.planId);
      }
    } catch (error) {
      console.error("Failed to parse saved payment", error);
      localStorage.removeItem(PAYMENT_STORAGE_KEY);
    }
  }, []);

  const selectedPlan = PAYMENT_PLANS.find((plan) => plan.id === selectedPlanId) ?? PAYMENT_PLANS[0];

  const activeSubscription = useMemo(() => {
    if (user?.subscriptionStatus === "ACTIVE" && user?.subscriptionPlan) {
      const matchedPlan = PAYMENT_PLANS.find((plan) => plan.subscriptionPlan === user.subscriptionPlan) ?? PAYMENT_PLANS[0];
      return {
        ...matchedPlan,
        activatedAt: user.subscriptionActivatedAt,
        expiresAt: user.subscriptionExpiresAt,
        autoRenew: Boolean(user.autoRenew),
        orderCode: latestPayment?.orderCode || "--"
      };
    }

    if (latestPayment?.status === "PAID") {
      const matchedPlan = PAYMENT_PLANS.find((plan) => plan.id === latestPayment.planId) ?? PAYMENT_PLANS[0];
      return {
        ...matchedPlan,
        activatedAt: latestPayment.updatedAt || latestPayment.createdAt,
        expiresAt: addMonths(latestPayment.updatedAt || latestPayment.createdAt, matchedPlan.cycleMonths),
        autoRenew: Boolean(latestPayment.autoRenew),
        orderCode: latestPayment.orderCode
      };
    }

    return null;
  }, [latestPayment, user]);

  const savePayment = (payment) => {
    setLatestPayment(payment);
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payment));
  };

  const handleCreatePayment = async (event) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.CREATE_PAYMENT, {
        planId: selectedPlan.id
      });

      const paymentData = {
        ...response.data,
        planId: selectedPlan.id,
        planName: selectedPlan.displayName,
        cycleLabel: selectedPlan.cycleLabel,
        cycleMonths: selectedPlan.cycleMonths,
        autoRenew
      };

      savePayment(paymentData);
      window.location.href = response.data.checkoutUrl;
    } catch (error) {
      toast.error(error.response?.data?.message || "Khong the khoi tao thanh toan");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    const nextValue = !autoRenew;
    setAutoRenew(nextValue);

    if (latestPayment) {
      savePayment({
        ...latestPayment,
        autoRenew: nextValue
      });
    }

    try {
      const response = await axiosConfig.put(API_ENDPOINTS.UPDATE_AUTO_RENEW, { enabled: nextValue });
      setUser(response.data);
    } catch (error) {
      setAutoRenew(!nextValue);
      toast.error(error.response?.data?.message || "Khong the cap nhat tu gia han");
    }
  };

  const handleUpgradePlan = () => {
    setShowUpgradeOptions(true);
    if (activeSubscription?.id === "basic") {
      setSelectedPlanId("premium");
    }
  };

  return (
    <Dashboard activeMenu="Payment">
      <div className="mx-auto my-6 max-w-6xl px-4 md:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">Thanh toan</h1>
          <p className="mt-2 text-sm text-slate-500">
            {activeSubscription
              ? "Goi cua ban dang hoat dong. Ban co the quan ly hoac nang cap bat cu luc nao."
              : "Chon goi dich vu phu hop va thanh toan nhanh qua PayOS."}
          </p>
        </div>

        {activeSubscription && !showUpgradeOptions ? (
          <section className="overflow-hidden rounded-[32px] border border-emerald-200 bg-white shadow-sm">
            <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
              <div className={`bg-gradient-to-br ${activeSubscription.accent} px-8 py-8 text-white`}>
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/75">
                  <Star size={16} />
                  <span>Subscription active</span>
                </div>

                <h2 className="mt-5 text-4xl font-semibold">{activeSubscription.displayName} active</h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-white/80">
                  Ban da so huu goi nay va dang dung day du cac quyen loi cua tai khoan nang cap.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {activeSubscription.features.map((feature) => (
                    <div key={feature} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <BadgeCheck size={16} className="text-emerald-300" />
                        <span>{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                    onClick={handleUpgradePlan}
                    type="button"
                  >
                    <Zap size={16} />
                    Nang cap goi
                  </button>

                  <button
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    onClick={() => setShowManagePanel((current) => !current)}
                    type="button"
                  >
                    <Settings2 size={16} />
                    Quan ly goi
                  </button>

                  <Link
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    to="/dashboard"
                  >
                    <House size={16} />
                    Ve Dashboard
                  </Link>
                </div>
              </div>

              <div className="bg-slate-50 px-8 py-8">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Goi hien tai</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-900">{activeSubscription.displayName}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Luc nay tai khoan cua ban da o trang thai so huu goi, khong con la buoc di thanh toan nua.
                </p>

                <div className="mt-6 space-y-3">
                  <SubscriptionRow label="Trang thai" value="Dang hoat dong" />
                  <SubscriptionRow label="Ngay kich hoat" value={formatDate(activeSubscription.activatedAt)} />
                  <SubscriptionRow label="Ngay het han" value={formatDate(activeSubscription.expiresAt)} />
                  <SubscriptionRow label="Tu gia han" value={autoRenew ? "Bat" : "Tat"} />
                  <SubscriptionRow label="Ma don hang" value={activeSubscription.orderCode || "--"} />
                </div>

                {showManagePanel ? (
                  <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">Quan ly goi</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Dieu chinh cach goi cua ban duoc duy tri sau khi het han.
                        </p>
                      </div>

                      <button
                        className={`relative h-8 w-14 rounded-full transition ${autoRenew ? "bg-emerald-500" : "bg-slate-300"}`}
                        onClick={handleToggleAutoRenew}
                        type="button"
                      >
                        <span
                          className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${autoRenew ? "left-7" : "left-1"}`}
                        />
                      </button>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      {autoRenew
                        ? "Tu gia han dang bat. He thong se giu goi cua ban o trang thai lien mach hon."
                        : "Tu gia han dang tat. Ban van co the quay lai day de gia han hoac nang cap bat cu luc nao."}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {activeSubscription ? "Nang cap goi cua ban" : "Chon goi dich vu"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {activeSubscription
                    ? "Chon goi moi de nang cap hoac gia han tai khoan cua ban."
                    : "He thong se tao giao dich va chuyen ban truc tiep den trang checkout cua PayOS."}
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {PAYMENT_PLANS.map((plan) => {
                    const isSelected = plan.id === selectedPlanId;
                    const isCurrentPlan = activeSubscription?.id === plan.id;
                    const Icon = plan.icon;

                    return (
                      <button
                        key={plan.id}
                        className={`rounded-[28px] border p-5 text-left transition ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                            : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white"
                        }`}
                        onClick={() => setSelectedPlanId(plan.id)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className={`rounded-2xl p-3 ${isSelected ? "bg-white/10" : "bg-slate-900 text-white"}`}>
                            <Icon size={20} />
                          </div>
                          <div className="flex items-center gap-2">
                            {isCurrentPlan ? (
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isSelected ? "bg-emerald-400/20 text-emerald-200" : "bg-emerald-100 text-emerald-700"}`}>
                                Dang dung
                              </span>
                            ) : null}
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isSelected ? "bg-white/10 text-white" : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {plan.badge}
                            </span>
                          </div>
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">{plan.displayName}</h3>
                        <p className={`mt-2 text-sm ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                          {plan.features[0]}
                        </p>

                        <p className="mt-5 text-3xl font-semibold">
                          {Number(plan.amount).toLocaleString("vi-VN")}d
                        </p>

                        <div className="mt-5 space-y-2">
                          {plan.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-sm">
                              <BadgeCheck size={16} className={isSelected ? "text-emerald-300" : "text-emerald-600"} />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form className="rounded-[28px] border border-slate-200 bg-slate-50 p-6" onSubmit={handleCreatePayment}>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                  {activeSubscription ? "Goi chuan bi cap nhat" : "Goi da chon"}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{selectedPlan.displayName}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {activeSubscription
                    ? "Sau khi thanh toan, goi hien tai cua ban se duoc cap nhat theo lua chon moi."
                    : "Sau khi bam thanh toan, ban se duoc chuyen ngay sang PayOS de quet ma QR hoac chon phuong thuc thanh toan phu hop."}
                </p>

                <div className="mt-6 rounded-3xl bg-white p-5">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-sm text-slate-500">Tong thanh toan</span>
                    <span className="text-3xl font-semibold text-slate-900">
                      {Number(selectedPlan.amount).toLocaleString("vi-VN")}d
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <SubscriptionRow label="Ten goi" value={selectedPlan.displayName} />
                    <SubscriptionRow label="Mo ta" value={selectedPlan.description} />
                    <SubscriptionRow label="Chu ky" value={selectedPlan.cycleLabel} />
                  </div>
                </div>

                <button
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCreating}
                  type="submit"
                >
                  <CreditCard size={18} />
                  {isCreating
                    ? "Dang chuyen den checkout..."
                    : activeSubscription
                      ? selectedPlan.id === activeSubscription.id
                        ? "Gia han goi"
                        : "Nang cap goi"
                      : "Thanh toan"}
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
    </Dashboard>
  );
};

const SubscriptionRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="max-w-[65%] break-words text-right text-sm font-medium text-slate-900">{value}</span>
  </div>
);

const addMonths = (dateValue, months) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  date.setMonth(date.getMonth() + months);
  return date.toISOString();
};

const formatDate = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

export default Payment;
