import React, { useContext, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../constants/api";
import apiClient from "../../services/apiClient";
import { formatMoney, getApiErrorMessage } from "../../utils/format";
import { COLORS, useAppColors } from "../../constants/colors";
import { getSafeAreaContentStyle } from "../../utils/safeArea";

const PAYMENT_STATUS_LABELS = {
  PAID: "Đã thanh toán thành công",
  PENDING: "Đang chờ thanh toán",
  PROCESSING: "Đang xử lý",
  FAILED: "Thanh toán thất bại",
  CANCELLED: "Đã hủy",
  EXPIRED: "Đã hết hạn",
  UNDERPAID: "Thanh toán chưa đủ"
};

export default function PaymentResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { refreshUser } = useContext(AuthContext);

  const result = String(route.params?.result || "").toLowerCase();
  const orderCode = route.params?.orderCode ? String(route.params.orderCode) : "";
  const returnedStatus = String(route.params?.status || "").toUpperCase();
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  const displayStatus = useMemo(() => {
    if (returnedStatus === "PAID") {
      return "PAID";
    }
    if (payment?.status) {
      return String(payment.status).toUpperCase();
    }
    if (result === "cancel") {
      return "CANCELLED";
    }
    return "PENDING";
  }, [payment?.status, result, returnedStatus]);

  useEffect(() => {
    let active = true;

    const syncPaymentStatus = async () => {
      if (!orderCode) {
        return;
      }

      try {
        const response = await apiClient.get(API_ENDPOINTS.SYNC_PAYMENT_STATUS(orderCode));
        if (!active) {
          return;
        }

        const nextPayment = response.data || null;
        setPayment(nextPayment);

        const nextStatus = String(nextPayment?.status || returnedStatus || "").toUpperCase();
        if (nextStatus === "PAID") {
          await refreshUser();
        }
      } catch (syncError) {
        if (active) {
          setError(getApiErrorMessage(syncError, "Không thể đồng bộ trạng thái thanh toán."));
        }
      }
    };

    syncPaymentStatus();

    return () => {
      active = false;
    };
  }, [orderCode, refreshUser, returnedStatus]);

  const isSuccess = displayStatus === "PAID";

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.BG }]} contentContainerStyle={[styles.content, getSafeAreaContentStyle(insets)]}>
      <View style={[styles.statusCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}> 
        <View style={styles.iconContainer}>
          <View style={[styles.statusIconWrap, { backgroundColor: isSuccess ? "rgba(42, 157, 143, 0.1)" : "rgba(231, 111, 81, 0.1)" }]}>
            <Ionicons 
              name={isSuccess ? "checkmark-circle" : "close-circle"} 
              size={64} 
              color={isSuccess ? colors.INCOME : colors.EXPENSE} 
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.TEXT }]}>Trạng thái giao dịch</Text>
        <Text style={[styles.statusValue, { color: isSuccess ? colors.INCOME : colors.EXPENSE }]}> 
          {PAYMENT_STATUS_LABELS[displayStatus] || displayStatus}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.CARD_BORDER }]} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.TEXT_SECONDARY }]}>Mã đơn hàng</Text>
          <Text style={[styles.detailValue, { color: colors.TEXT }]}>{orderCode || "--"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.TEXT_SECONDARY }]}>Số tiền</Text>
          <Text style={[styles.detailValue, { color: colors.PRIMARY }]}>{payment?.amount ? formatMoney(payment.amount) : "--"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.TEXT_SECONDARY }]}>Gói dịch vụ</Text>
          <Text style={[styles.detailValue, { color: colors.TEXT }]}>{payment?.planName || "--"}</Text>
        </View>
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.EXPENSE_LIGHT, borderColor: colors.EXPENSE }]}> 
          <Text style={[styles.errorText, { color: colors.EXPENSE }]}>{error}</Text>
        </View>
      ) : null}

      <Pressable 
        style={[styles.homeButton, { backgroundColor: colors.PRIMARY, shadowColor: colors.PRIMARY }]} 
        onPress={() => navigation.navigate("HomeTab")}
      >
        <Text style={styles.homeButtonText}>Về trang chủ</Text>
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
    gap: 14
  },
  statusCard: {
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  statusIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontWeight: "700",
    textAlign: "center",
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    fontWeight: "600",
    fontSize: 13,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14
  },
  errorText: {
    fontSize: 13,
  },
  homeButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  homeButtonText: {
    color: COLORS.WHITE,
    fontWeight: "800",
    fontSize: 15
  }
});
