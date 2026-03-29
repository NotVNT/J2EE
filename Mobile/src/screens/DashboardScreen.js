import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import HomeTopHeader from "../components/HomeTopHeader";
import HomeBanner from "../components/HomeBanner";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { formatDate, formatMoney, getApiErrorMessage } from "../utils/format";

function MetricCard({ icon, label, value, color }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: color }]}>
        <Text style={styles.metricIconText}>{icon}</Text>
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

function SectionHeader({ title, onMore }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onMore ? (
        <Pressable onPress={onMore}>
          <Text style={styles.sectionMore}>Xem thêm</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function TransactionRow({ item }) {
  const isIncome = String(item?.type || "").toUpperCase().includes("INCOME");
  const amountColor = isIncome ? "#15803d" : "#b91c1c";
  const sign = isIncome ? "+" : "-";

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionIcon}>{item?.icon || "🧾"}</Text>
        <View>
          <Text style={styles.transactionName}>{item?.name || "Giao dịch"}</Text>
          <Text style={styles.transactionDate}>{formatDate(item?.date)}</Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>{sign}{formatMoney(item?.amount)}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    const response = await http.get(API_ENDPOINTS.DASHBOARD_DATA);
    setDashboard(response.data || null);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDashboard();
    } catch (error) {
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được dữ liệu trang chủ"));
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboard]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const recentTransactions = useMemo(
    () => (dashboard?.recentTransactions || []).slice(0, 5),
    [dashboard?.recentTransactions]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <HomeTopHeader
        onMenuPress={() => navigation.navigate("SettingTab")}
        onBellPress={() => Alert.alert("Thông báo", "Bạn chưa có thông báo mới.")}
      />
      <HomeBanner />

      <View style={styles.metricsGrid}>
        <MetricCard icon="💼" label="Tổng số dư" value={formatMoney(dashboard?.totalBalance)} color="#6d28d9" />
        <MetricCard icon="💰" label="Tổng thu nhập" value={formatMoney(dashboard?.totalIncome)} color="#047857" />
        <MetricCard icon="💸" label="Tổng chi tiêu" value={formatMoney(dashboard?.totalExpense)} color="#b91c1c" />
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard icon="🎯" label="Mục tiêu đang chạy" value={String(dashboard?.savingGoalActiveCount || 0)} color="#4338ca" />
        <MetricCard icon="🐷" label="Đã tích lũy" value={formatMoney(dashboard?.savingGoalTotalSaved)} color="#0f766e" />
        <MetricCard icon="✅" label="Mục tiêu hoàn thành" value={String(dashboard?.savingGoalCompletedCount || 0)} color="#0f766e" />
      </View>

      <SectionHeader title="Giao dịch gần đây" onMore={() => navigation.navigate("ExpenseTab")} />
      <View style={styles.sectionCard}>
        {recentTransactions.length ? (
          recentTransactions.map((item) => <TransactionRow key={item.id || `${item.name}-${item.date}`} item={item} />)
        ) : (
          <Text style={styles.emptyText}>Chưa có giao dịch gần đây.</Text>
        )}
      </View>

      <SectionHeader title="Tổng quan tài chính" />
      <View style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <Text style={styles.overviewLabel}>Tổng số dư</Text>
          <Text style={styles.overviewValue}>{formatMoney(dashboard?.totalBalance)}</Text>
        </View>
        <View style={styles.overviewLegendRow}>
          <Text style={styles.legendItem}>🔴 Chi tiêu: {formatMoney(dashboard?.totalExpense)}</Text>
          <Text style={styles.legendItem}>🟣 Số dư: {formatMoney(dashboard?.totalBalance)}</Text>
          <Text style={styles.legendItem}>🟢 Thu nhập: {formatMoney(dashboard?.totalIncome)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f8"
  },
  content: {
    padding: 14,
    paddingBottom: 22,
    gap: 12
  },
  metricsGrid: {
    gap: 8
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe3f2",
    padding: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  metricIconText: {
    fontSize: 18
  },
  metricContent: {
    marginLeft: 10,
    flex: 1
  },
  metricLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 3
  },
  metricValue: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "800"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800"
  },
  sectionMore: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700"
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe3f2",
    padding: 12
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7"
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8
  },
  transactionIcon: {
    fontSize: 18,
    marginRight: 8
  },
  transactionName: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 14
  },
  transactionDate: {
    color: "#64748b",
    marginTop: 2,
    fontSize: 12
  },
  transactionAmount: {
    fontWeight: "800",
    fontSize: 13
  },
  emptyText: {
    color: "#64748b"
  },
  overviewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe3f2",
    padding: 12,
    gap: 8
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  overviewLabel: {
    color: "#334155",
    fontWeight: "700"
  },
  overviewValue: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 18
  },
  overviewLegendRow: {
    gap: 4
  },
  legendItem: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600"
  }
});
