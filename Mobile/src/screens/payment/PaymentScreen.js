import React, { useCallback, useContext, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PaymentHistorySection from "../../components/Payment/PaymentHistorySection";
import { API_ENDPOINTS } from "../../constants/api";
import { useAppColors } from "../../constants/colors";
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
        const activeBg = colors.CARD === "#FFFFFF"
          ? "#F7F3FF" // Solid light brand purple
          : "#221930"; // Solid dark brand purple

        return (
          <Pressable
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: active ? activeBg : colors.CARD,
                borderColor: active ? (colors.ACTION_VOICE || '#A855F7') : colors.CARD_BORDER,
              },
            ]}
            onPress={() => setSelectedPlanId(plan.id)}
          >
            <Text style={[styles.planName, { color: colors.TEXT }]}>{plan.displayName}</Text>
            <Text style={[styles.planAmount, { color: colors.ACTION_VOICE || '#A855F7' }]}>{formatMoney(plan.amount)} / {plan.cycleLabel}</Text>
            <Text style={[styles.planDescription, { color: colors.TEXT_SECONDARY }]}>{plan.description}</Text>
          </Pressable>
        );
      })}

      <Pressable
        style={[styles.button, { backgroundColor: colors.ACTION_VOICE || '#A855F7', shadowColor: colors.ACTION_VOICE || '#A855F7', elevation: 4 }, loading && styles.buttonDisabled]}
        onPress={createPayment}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Đang xử lý..." : "Thanh toán"}</Text>
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
    gap: 10
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
  planCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2
  },
  planName: {
    fontWeight: "800",
    fontSize: 16
  },
  planAmount: {
    fontWeight: "800",
    marginTop: 4
  },
  planDescription: {
    marginTop: 6,
    fontSize: 13
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  }
});
