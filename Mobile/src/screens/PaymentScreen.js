import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { PAYMENT_PLANS } from "../constants/paymentPlans";
import { formatMoney, getApiErrorMessage } from "../utils/format";

export default function PaymentScreen() {
  const navigation = useNavigation();
  const [selectedPlanId, setSelectedPlanId] = useState(PAYMENT_PLANS[0]?.id || "basic");
  const [loading, setLoading] = useState(false);

  const selectedPlan = PAYMENT_PLANS.find((plan) => plan.id === selectedPlanId) || PAYMENT_PLANS[0];

  const createPayment = async () => {
    if (!selectedPlan) {
      return;
    }

    setLoading(true);
    try {
      const response = await http.post(API_ENDPOINTS.CREATE_PAYMENT, {
        planId: selectedPlan.id,
        amount: selectedPlan.amount,
        description: `Thanh toan ${selectedPlan.displayName}`
      });

      const checkoutUrl = response?.data?.checkoutUrl;
      if (!checkoutUrl) {
        Alert.alert("Tao lien ket thanh cong", "Khong tim thay checkoutUrl de mo cong thanh toan.");
        return;
      }

      navigation.navigate("PaymentCheckout", {
        checkoutUrl,
        orderCode: response?.data?.orderCode ? String(response.data.orderCode) : "",
        planName: selectedPlan.displayName
      });
    } catch (error) {
      Alert.alert("Tao thanh toan that bai", getApiErrorMessage(error, "Khong the tao lien ket thanh toan."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nang cap goi dich vu</Text>
      <Text style={styles.subtitle}>
        Cong thanh toan se duoc nhung ngay trong app. Sau khi thanh toan xong, ung dung se chuyen thang den man hinh ket qua.
      </Text>

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

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={createPayment} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Dang xu ly..." : "Mo cong thanh toan trong app"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  content: {
    padding: 16,
    gap: 10
  },
  title: {
    fontSize: 22,
    color: "#0f172a",
    fontWeight: "700",
    marginBottom: 4
  },
  subtitle: {
    color: "#475569",
    lineHeight: 21,
    marginBottom: 6
  },
  planCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12
  },
  planCardActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff"
  },
  planName: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16
  },
  planAmount: {
    color: "#1d4ed8",
    fontWeight: "700",
    marginTop: 3
  },
  planDescription: {
    color: "#64748b",
    marginTop: 4
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700"
  }
});
