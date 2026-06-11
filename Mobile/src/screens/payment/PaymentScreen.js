import React, { useCallback, useContext, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import PaymentHistorySection from "../../components/Payment/PaymentHistorySection";
import { API_ENDPOINTS } from "../../constants/api";
import { COLORS, useAppColors } from "../../constants/colors";
import { AuthContext } from "../../contexts/AuthContext";
import apiClient from "../../services/apiClient";
import { formatMoney, getApiErrorMessage } from "../../utils/format";

async function createPaymentLink(payload) {
  const response = await apiClient.post(API_ENDPOINTS.CREATE_PAYMENT, payload);
  return response.data;
}

async function fetchPaymentHistory() {
  const response = await apiClient.get(API_ENDPOINTS.GET_PAYMENTS);
  return Array.isArray(response.data) ? response.data : [];
}

async function syncPaymentStatus(orderCode) {
  const response = await apiClient.get(API_ENDPOINTS.SYNC_PAYMENT_STATUS(orderCode));
  return response.data;
}

async function deletePayment(orderCode) {
  const response = await apiClient.delete(API_ENDPOINTS.DELETE_PAYMENT(orderCode));
  return response.data;
}
import { getSafeAreaContentStyle } from "../../utils/safeArea";
import { PAYMENT_PLANS } from "./paymentPlans";
import ScreenBackHeader from "../../components/common/ScreenBackHeader";
import AppIcon from "../../components/ui/AppIcon";

export default function PaymentScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { refreshUser } = useContext(AuthContext);
  const [selectedPlanId, setSelectedPlanId] = useState(PAYMENT_PLANS[0]?.id || "basic");
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshingHistory, setRefreshingHistory] = useState(false);
  const [syncingCode, setSyncingCode] = useState("");
  const [deletingCode, setDeletingCode] = useState("");

  const selectedPlan = PAYMENT_PLANS.find((plan) => plan.id === selectedPlanId) || PAYMENT_PLANS[0];
  const brandColor = colors.ACTION_VOICE || "#A855F7";
  const isDarkMode = colors.CARD !== "#FFFFFF";

  const loadPaymentHistory = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setRefreshingHistory(true);
    } else {
      setHistoryLoading(true);
    }

    try {
      const history = await fetchPaymentHistory();
      setPayments(history);
    } catch (error) {
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được lịch sử thanh toán."));
    } finally {
      setHistoryLoading(false);
      setRefreshingHistory(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadPaymentHistory();
  }, [loadPaymentHistory]));

  const handleRefreshHistory = useCallback(() => {
    loadPaymentHistory({ refreshing: true });
  }, [loadPaymentHistory]);

  const handleSyncPaymentStatus = useCallback(async (orderCode) => {
    if (!orderCode) return;

    setSyncingCode(String(orderCode));
    try {
      const updatedPayment = await syncPaymentStatus(orderCode);
      setPayments((currentPayments) => currentPayments.map((payment) => (
        String(payment?.orderCode) === String(orderCode)
          ? { ...payment, ...updatedPayment }
          : payment
      )));

      if (String(updatedPayment?.status || "").toUpperCase() === "PAID") {
        await refreshUser?.();
      }

      Alert.alert("Thành công", "Đã cập nhật trạng thái thanh toán.");
    } catch (error) {
      Alert.alert("Cập nhật thất bại", getApiErrorMessage(error, "Không thể cập nhật trạng thái thanh toán."));
    } finally {
      setSyncingCode("");
    }
  }, [refreshUser]);

  const handleDeletePayment = useCallback((orderCode) => {
    if (!orderCode) return;

    Alert.alert("Xóa hóa đơn?", "Hóa đơn này sẽ được xóa khỏi lịch sử thanh toán của bạn.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          setDeletingCode(String(orderCode));
          try {
            await deletePayment(orderCode);
            setPayments((currentPayments) => currentPayments.filter((payment) => (
              String(payment?.orderCode) !== String(orderCode)
            )));
          } catch (error) {
            Alert.alert("Xóa thất bại", getApiErrorMessage(error, "Không thể xóa hóa đơn này."));
          } finally {
            setDeletingCode("");
          }
        }
      }
    ]);
  }, []);

  const createPayment = async () => {
    if (!selectedPlan) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn gói dịch vụ trước khi thanh toán.");
      return;
    }

    setLoading(true);
    try {
      const response = await createPaymentLink({
        planId: selectedPlan.id,
        amount: selectedPlan.amount,
        description: `Thanh toán ${selectedPlan.displayName}`
      });

      const checkoutUrl = response?.checkoutUrl;
      if (!checkoutUrl) {
        Alert.alert("Tạo liên kết thành công", "Không tìm thấy liên kết để mở cổng thanh toán.");
        return;
      }

      navigation.navigate("PaymentCheckout", {
        checkoutUrl,
        orderCode: response?.orderCode ? String(response.orderCode) : "",
        planName: selectedPlan.displayName
      });
    } catch (error) {
      Alert.alert("Tạo thanh toán thất bại", getApiErrorMessage(error, "Không thể tạo liên kết thanh toán."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.BG }]} contentContainerStyle={[styles.content, getSafeAreaContentStyle(insets)]}>
      <ScreenBackHeader title="Thanh toán" />
      <Text style={[styles.title, { color: colors.TEXT }]}>Nâng cấp gói dịch vụ</Text>
      <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
        Cổng thanh toán sẽ được nhúng ngay trong app. Sau khi thanh toán xong, ứng dụng sẽ chuyển thẳng đến màn hình kết quả.
      </Text>

      {PAYMENT_PLANS.map((plan) => {
        const active = plan.id === selectedPlanId;
        const premium = plan.id === "premium";
        const gradientColors = active
          ? (premium ? ["#7C3AED", "#A855F7"] : ["#8B5CF6", "#A855F7"])
          : (premium
            ? (isDarkMode ? ["#231A31", colors.CARD] : ["#FFFFFF", "#F7F0FF"])
            : [colors.CARD, colors.CARD]);
        const textColor = active ? COLORS.WHITE : colors.TEXT;
        const secondaryTextColor = active ? "rgba(255,255,255,0.76)" : colors.TEXT_SECONDARY;

        return (
          <Pressable
            key={plan.id}
            style={[
              styles.planPressable,
              {
                shadowColor: active ? brandColor : "#000",
                shadowOpacity: active ? 0.2 : 0.04,
                elevation: active ? 5 : 2
              },
            ]}
            onPress={() => setSelectedPlanId(plan.id)}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.planCard,
                {
                  borderColor: active ? "transparent" : (premium ? "rgba(168,85,247,0.25)" : colors.CARD_BORDER)
                }
              ]}
            >
              <View style={styles.planTopRow}>
                <View style={[
                  styles.planIconWrap,
                  { backgroundColor: active ? "rgba(255,255,255,0.16)" : (premium ? brandColor : colors.BG) }
                ]}>
                  <AppIcon name={plan.icon} size={20} color={active || premium ? COLORS.WHITE : brandColor} />
                </View>
                <View style={[
                  styles.planBadge,
                  { backgroundColor: active ? "rgba(255,255,255,0.18)" : (premium ? "rgba(168,85,247,0.12)" : colors.BG) }
                ]}>
                  <Text style={[styles.planBadgeText, { color: active ? COLORS.WHITE : (premium ? brandColor : colors.TEXT_SECONDARY) }]}>
                    {plan.badge}
                  </Text>
                </View>
              </View>

              <Text style={[styles.planName, { color: textColor }]}>{plan.displayName}</Text>
              <Text style={[styles.planDescription, { color: secondaryTextColor }]}>{plan.description}</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.planAmount, { color: textColor }]}>{formatMoney(plan.amount)}</Text>
                <Text style={[styles.planCycle, { color: secondaryTextColor }]}>/ {plan.cycleLabel}</Text>
              </View>

              <View style={styles.featureList}>
                {plan.features.map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <AppIcon name="checkmark-circle" size={15} color={active ? "#BBF7D0" : colors.INCOME} />
                    <Text style={[styles.featureText, { color: secondaryTextColor }]}>{feature}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Pressable>
        );
      })}

      <Pressable
        style={[styles.button, { shadowColor: brandColor, elevation: 4 }, loading && styles.buttonDisabled]}
        onPress={createPayment}
        disabled={loading}
      >
        <LinearGradient colors={["#A855F7", "#9333EA"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
          <AppIcon name="card-outline" size={17} color={COLORS.WHITE} />
          <Text style={styles.buttonText}>{loading ? "Đang xử lý..." : `Thanh toán ${selectedPlan?.displayName || ""}`}</Text>
        </LinearGradient>
      </Pressable>

      <PaymentHistorySection
        deletingCode={deletingCode}
        loading={historyLoading}
        onDelete={handleDeletePayment}
        onRefresh={handleRefreshHistory}
        onSync={handleSyncPaymentStatus}
        payments={payments}
        refreshing={refreshingHistory}
        syncingCode={syncingCode}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 6
  },
  planPressable: {
    borderRadius: 18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },
  planCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    overflow: "hidden"
  },
  planTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  planIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  planBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: "800"
  },
  planName: {
    fontWeight: "800",
    fontSize: 17
  },
  planAmount: {
    fontWeight: "800",
    fontSize: 22
  },
  planCycle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 3
  },
  planDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    marginTop: 12
  },
  featureList: {
    gap: 7,
    marginTop: 13
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  featureText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17
  },
  button: {
    borderRadius: 14,
    marginTop: 10,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonGradient: {
    minHeight: 48,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  }
});
