import React, { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { PAYMENT_PLANS } from "../constants/paymentPlans";
import { formatMoney, getApiErrorMessage } from "../utils/format";

export default function PaymentScreen() {
  const [selectedPlanId, setSelectedPlanId] = useState(PAYMENT_PLANS[0]?.id || "basic");
  const [orderCode, setOrderCode] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedPlan = PAYMENT_PLANS.find((plan) => plan.id === selectedPlanId) || PAYMENT_PLANS[0];

  const createPayment = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const response = await http.post(API_ENDPOINTS.CREATE_PAYMENT, {
        planId: selectedPlan.id,
        amount: selectedPlan.amount,
        description: `Thanh toán ${selectedPlan.displayName}`
      });

      const checkoutUrl = response?.data?.checkoutUrl;
      const newOrderCode = response?.data?.orderCode;
      if (newOrderCode) {
        setOrderCode(String(newOrderCode));
      }

      if (checkoutUrl) {
        await Linking.openURL(checkoutUrl);
      } else {
        Alert.alert("Tạo liên kết thành công", "Không tìm thấy checkoutUrl để mở tự động.");
      }
    } catch (error) {
      Alert.alert("Tạo thanh toán thất bại", getApiErrorMessage(error, "Không thể tạo liên kết thanh toán."));
    } finally {
      setLoading(false);
    }
  };

  const syncStatus = async () => {
    if (!orderCode.trim()) {
      Alert.alert("Thiếu orderCode", "Vui lòng nhập hoặc tạo orderCode trước.");
      return;
    }

    setLoading(true);
    try {
      const response = await http.get(API_ENDPOINTS.SYNC_PAYMENT_STATUS(orderCode.trim()));
      const status = response?.data?.status || response?.data?.paymentStatus || "UNKNOWN";
      Alert.alert("Trạng thái thanh toán", `Status: ${status}`);
    } catch (error) {
      Alert.alert("Đồng bộ thất bại", getApiErrorMessage(error, "Không thể đồng bộ trạng thái thanh toán."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nâng cấp gói dịch vụ</Text>

      {PAYMENT_PLANS.map((plan) => {
        const active = plan.id === selectedPlanId;

        return (
          <Pressable key={plan.id} style={[styles.planCard, active && styles.planCardActive]} onPress={() => setSelectedPlanId(plan.id)}>
            <Text style={styles.planName}>{plan.displayName}</Text>
            <Text style={styles.planAmount}>{formatMoney(plan.amount)} / {plan.cycleLabel}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
          </Pressable>
        );
      })}

        <Pressable style={styles.button} onPress={createPayment} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Đang xử lý..." : "Tạo link thanh toán"}</Text>
        </Pressable>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 10 },
  title: { fontSize: 22, color: "#0f172a", fontWeight: "700", marginBottom: 4 },
  planCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12
  },
  planCardActive: {
    borderColor: "#7c3aed",
    backgroundColor: "#f5f3ff"
  },
  planName: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  planAmount: { color: "#6d28d9", fontWeight: "700", marginTop: 3 },
  planDescription: { color: "#64748b", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12
  },
  cardTitle: { color: "#0f172a", fontWeight: "700", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8
  },
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontWeight: "700" }
});
