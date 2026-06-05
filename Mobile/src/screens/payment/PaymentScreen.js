import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppColors } from "../../constants/colors";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../constants/api";
import { formatMoney, getApiErrorMessage } from "../../utils/format";
import { getSafeAreaContentStyle } from "../../utils/safeArea";
import { PAYMENT_PLANS } from "./paymentPlans";

export default function PaymentScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const [selectedPlanId, setSelectedPlanId] = useState(PAYMENT_PLANS[0]?.id || "basic");
  const [loading, setLoading] = useState(false);

  const selectedPlan = PAYMENT_PLANS.find((plan) => plan.id === selectedPlanId) || PAYMENT_PLANS[0];

  const createPayment = async () => {
    if (!selectedPlan) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn gói dịch vụ trước khi thanh toán.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.CREATE_PAYMENT, {
        planId: selectedPlan.id,
        amount: selectedPlan.amount,
        description: `Thanh toán ${selectedPlan.displayName}`
      });

      const checkoutUrl = response?.data?.checkoutUrl;
      if (!checkoutUrl) {
        Alert.alert("Tạo liên kết thành công", "Không tìm thấy liên kết để mở cổng thanh toán.");
        return;
      }

      navigation.navigate("PaymentCheckout", {
        checkoutUrl,
        orderCode: response?.data?.orderCode ? String(response.data.orderCode) : "",
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
      <Text style={[styles.title, { color: colors.TEXT }]}>Nâng cấp gói dịch vụ</Text>
      <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
        Cổng thanh toán sẽ được nhúng ngay trong app. Sau khi thanh toán xong, ứng dụng sẽ chuyển thẳng đến màn hình kết quả.
      </Text>

      {PAYMENT_PLANS.map((plan) => {
        const active = plan.id === selectedPlanId;

        return (
          <Pressable 
            key={plan.id} 
            style={[
              styles.planCard, 
              { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER },
              active && [styles.planCardActive, { borderColor: colors.ACTION_VOICE || '#A855F7', backgroundColor: 'rgba(168, 85, 247, 0.08)' }]
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
    borderWidth: 1,
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
  planCardActive: {
    borderWidth: 2,
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
