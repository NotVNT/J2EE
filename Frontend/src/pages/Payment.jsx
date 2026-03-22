import { useContext, useEffect, useMemo, useState } from "react";
import { BadgeCheck, CreditCard, House, Settings2, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Dashboard from "../components/Dashboard.jsx";
import { AppContext } from "../context/AppContext.jsx";
import { useUser } from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import { API_ENDPOINTS } from "../util/apiEndpoints.js";
import { getPaymentPlans } from "../util/paymentPlans.js";

const PAYMENT_STORAGE_KEY = "latestPayment";
const ICON_MAP = { ShieldCheck, Sparkles, Star, Zap };

const Payment = () => {
  useUser();

  const { user, setUser } = useContext(AppContext);
  const PAYMENT_PLANS = useMemo(() => {
    return getPaymentPlans().map((plan) => ({
      ...plan,
      icon: ICON_MAP[plan.icon] || ShieldCheck
    }));
  }, []);

  const [selectedPlanId, setSelectedPlanId] = useState(PAYMENT_PLANS[0]?.id || "");
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
      console.error("Không thể đọc dữ liệu thanh toán đã lưu", error);
      localStorage.removeItem(PAYMENT_STORAGE_KEY);
    }
  }, []);

  const selectedPlan = PAYMENT_PLANS.find((plan) => plan.id === selectedPlanId) ?? PAYMENT_PLANS[0];

  const activeSubscription = useMemo(() => {
    if (user?.subscriptionStatus === "ACTIVE" && user?.subscriptionPlan) {
      const matchedPlan =
        PAYMENT_PLANS.find((plan) => plan.subscriptionPlan === user.subscriptionPlan) ?? PAYMENT_PLANS[0];
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
  }, [latestPayment, PAYMENT_PLANS, user]);

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
      toast.error(error.response?.data?.message || "Không thể khởi tạo thanh toán.");
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
      toast.error(error.response?.data?.message || "Không thể cập nhật tùy chọn tự gia hạn.");
    }
  };

  const handleUpgradePlan = () => {
    setShowUpgradeOptions(true);
    if (activeSubscription?.id === "basic") {
      setSelectedPlanId("premium");
    }
  };

  return (
    <Dashboard activeMenu="Thanh toán">
      <div className="mx-auto my-6 max-w-6xl px-4 md:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">Thanh toán</h1>
          <p className="mt-2 text-sm text-slate-500">
            {activeSubscription
              ? "Gói của bạn đang hoạt động. Bạn có thể quản lý hoặc nâng cấp bất cứ lúc nào."
              : "Chọn gói dịch vụ phù hợp và thanh toán nhanh qua PayOS."}
          </p>
        </div>

        {activeSubscription && !showUpgradeOptions ? (
          <section className="overflow-hidden rounded-[32px] border border-emerald-200 bg-white shadow-sm">
            <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
              <div className={`bg-gradient-to-br ${activeSubscription.accent} px-8 py-8 text-white`}>
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/75">
                  <Star size={16} />
                  <span>Gói đang hoạt động</span>
                </div>

                <h2 className="mt-5 text-4xl font-semibold">{activeSubscription.displayName} đang hoạt động</h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-white/80">
                  Bạn đã sở hữu gói này và đang dùng đầy đủ các quyền lợi của tài khoản nâng cấp.
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
                    Nâng cấp gói
                  </button>

                  <button
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    onClick={() => setShowManagePanel((current) => !current)}
                    type="button"
                  >
                    <Settings2 size={16} />
                    Quản lý gói
                  </button>

                  <Link
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    to="/dashboard"
                  >
                    <House size={16} />
                    Về tổng quan
                  </Link>
                </div>
              </div>

              <div className="bg-slate-50 px-8 py-8">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Gói hiện tại</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-900">{activeSubscription.displayName}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Lúc này tài khoản của bạn đã ở trạng thái sở hữu gói nên không cần thanh toán lại.
                </p>

                <div className="mt-6 space-y-3">
                  <SubscriptionRow label="Trạng thái" value="Đang hoạt động" />
                  <SubscriptionRow label="Ngày kích hoạt" value={formatDate(activeSubscription.activatedAt)} />
                  <SubscriptionRow label="Ngày hết hạn" value={formatDate(activeSubscription.expiresAt)} />
                  <SubscriptionRow label="Tự gia hạn" value={autoRenew ? "Bật" : "Tắt"} />
                  <SubscriptionRow label="Mã đơn hàng" value={activeSubscription.orderCode || "--"} />
                </div>

                {showManagePanel ? (
                  <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">Quản lý gói</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Điều chỉnh cách gói của bạn được duy trì sau khi hết hạn.
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
                        ? "Tự gia hạn đang bật. Hệ thống sẽ giữ gói của bạn luôn liền mạch."
                        : "Tự gia hạn đang tắt. Bạn vẫn có thể quay lại đây để gia hạn hoặc nâng cấp bất cứ lúc nào."}
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
                  {activeSubscription ? "Nâng cấp gói của bạn" : "Chọn gói dịch vụ"}
                </h2>
                {activeSubscription ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Chọn gói mới để nâng cấp hoặc gia hạn tài khoản của bạn.
                  </p>
                ) : null}

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
                                Đang dùng
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
                          {Number(plan.amount).toLocaleString("vi-VN")} VND
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
                  {activeSubscription ? "Gói chuẩn bị cập nhật" : "Gói đã chọn"}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{selectedPlan.displayName}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {activeSubscription
                    ? "Sau khi thanh toán, gói hiện tại của bạn sẽ được cập nhật tương ứng."
                    : "Sau khi bấm thanh toán, bạn sẽ được chuyển đến cổng thanh toán PayOS."}
                </p>

                <div className="mt-6 rounded-3xl bg-white p-5">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <span className="text-sm text-slate-500">Tổng thanh toán</span>
                    <span className="text-3xl font-semibold text-slate-900">
                      {Number(selectedPlan.amount).toLocaleString("vi-VN")} VND
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <SubscriptionRow label="Tên gói" value={selectedPlan.displayName} />
                    <SubscriptionRow label="Mô tả" value={selectedPlan.description} />
                    <SubscriptionRow label="Chu kỳ" value={selectedPlan.cycleLabel} />
                  </div>
                </div>

                <button
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCreating}
                  type="submit"
                >
                  <CreditCard size={18} />
                  {isCreating
                    ? "Đang chuyển đến trang thanh toán..."
                    : activeSubscription
                      ? selectedPlan.id === activeSubscription.id
                        ? "Gia hạn gói"
                        : "Nâng cấp gói"
                      : "Thanh toán"}
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
