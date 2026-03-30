import React, { useContext, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthContext } from "../components/AuthContext";
import { API_ENDPOINTS } from "../constants/api";
import http from "../services/http";
import { formatMoney, getApiErrorMessage } from "../utils/format";

const PAYMENT_STATUS_LABELS = {
  PAID: "Da thanh toan thanh cong",
  PENDING: "Dang cho thanh toan",
  PROCESSING: "Dang xu ly",
  FAILED: "Thanh toan that bai",
  CANCELLED: "Da huy",
  EXPIRED: "Da het han",
  UNDERPAID: "Thanh toan chua du"
};

export default function PaymentResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { refreshUser } = useContext(AuthContext);

  const result = String(route.params?.result || "").toLowerCase();
  const orderCode = route.params?.orderCode ? String(route.params.orderCode) : "";
  const returnedStatus = String(route.params?.status || "").toUpperCase();
  const paymentLinkId = route.params?.id ? String(route.params.id) : "";

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderCode));
  const [error, setError] = useState("");

  const screenCopy = useMemo(() => {
    if (result === "cancel") {
      return {
        title: "Thanh toan da bi huy",
        description: "Ban co the tao lai giao dich moi hoac kiem tra trang thai neu da thanh toan o man hinh khac."
      };
    }

    return {
      title: "Dang cap nhat ket qua thanh toan",
      description: "Ung dung dang dong bo giao dich tu PayOS va se cap nhat goi dich vu cho ban."
    };
  }, [result]);

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

  const syncPaymentStatus = async (silent = false) => {
    if (!orderCode) {
      setLoading(false);
      if (!silent) {
        Alert.alert("Thieu ma don hang", "Khong tim thay orderCode de dong bo thanh toan.");
      }
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await http.get(API_ENDPOINTS.SYNC_PAYMENT_STATUS(orderCode));
      const nextPayment = response.data || null;
      setPayment(nextPayment);

      const nextStatus = String(nextPayment?.status || returnedStatus || "").toUpperCase();
      if (nextStatus === "PAID") {
        await refreshUser();
      }
    } catch (syncError) {
      const message = getApiErrorMessage(syncError, "Khong the dong bo trang thai thanh toan.");
      setError(message);
      if (!silent) {
        Alert.alert("Dong bo that bai", message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncPaymentStatus(true);
  }, [orderCode]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>{screenCopy.title}</Text>
        <Text style={styles.heroDescription}>{screenCopy.description}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Trang thai hien tai</Text>
        <Text style={[styles.statusValue, displayStatus === "PAID" ? styles.statusPaid : styles.statusNormal]}>
          {PAYMENT_STATUS_LABELS[displayStatus] || displayStatus}
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ma don hang</Text>
          <Text style={styles.detailValue}>{orderCode || "--"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ma giao dich</Text>
          <Text style={styles.detailValue}>{paymentLinkId || payment?.paymentLinkId || "--"}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>So tien</Text>
          <Text style={styles.detailValue}>
            {payment?.amount ? formatMoney(payment.amount) : "--"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Goi dich vu</Text>
          <Text style={styles.detailValue}>{payment?.planName || "--"}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]} disabled={loading} onPress={() => syncPaymentStatus(false)}>
        <Text style={styles.primaryButtonText}>{loading ? "Dang kiem tra..." : "Kiem tra lai trang thai"}</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Payment")}>
        <Text style={styles.secondaryButtonText}>Quay lai man hinh thanh toan</Text>
      </Pressable>

      <Pressable style={styles.ghostButton} onPress={() => navigation.navigate("Main")}>
        <Text style={styles.ghostButtonText}>Ve trang chu</Text>
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
    gap: 14
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#dbeafe"
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a"
  },
  heroDescription: {
    marginTop: 8,
    color: "#475569",
    lineHeight: 22
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12
  },
  sectionTitle: {
    color: "#334155",
    fontWeight: "600"
  },
  statusValue: {
    fontSize: 20,
    fontWeight: "700"
  },
  statusPaid: {
    color: "#15803d"
  },
  statusNormal: {
    color: "#1e293b"
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  detailLabel: {
    color: "#64748b"
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    color: "#0f172a",
    fontWeight: "600"
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 14,
    padding: 14
  },
  errorText: {
    color: "#b91c1c"
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1"
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "700"
  },
  ghostButton: {
    paddingVertical: 10,
    alignItems: "center"
  },
  ghostButtonText: {
    color: "#475569",
    fontWeight: "600"
  },
  buttonDisabled: {
    opacity: 0.7
  }
});
