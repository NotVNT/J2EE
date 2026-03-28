import React, { useCallback, useContext, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { formatMoney, getApiErrorMessage } from "../utils/format";

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}> 
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useContext(AuthContext);
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
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được dữ liệu tổng quan"));
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboard]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Xin chào, {user?.fullName || user?.email || "bạn"}</Text>

      <StatCard label="Tổng số dư" value={formatMoney(dashboard?.totalBalance)} color="#7c3aed" />
      <StatCard label="Tổng thu nhập" value={formatMoney(dashboard?.totalIncome)} color="#15803d" />
      <StatCard label="Tổng chi tiêu" value={formatMoney(dashboard?.totalExpense)} color="#b91c1c" />
      <StatCard label="Tháng này" value={formatMoney(dashboard?.monthBalance)} color="#0f766e" />

      <View style={styles.quickGrid}>
        <Pressable style={styles.quickButton} onPress={() => navigation.navigate("Expense")}> 
          <Text style={styles.quickButtonText}>💸 Chi tiêu</Text>
        </Pressable>
        <Pressable style={styles.quickButton} onPress={() => navigation.navigate("Income")}>
          <Text style={styles.quickButtonText}>💰 Thu nhập</Text>
        </Pressable>
        <Pressable style={styles.quickButton} onPress={() => navigation.navigate("Budget")}>
          <Text style={styles.quickButtonText}>🎯 Ngân sách</Text>
        </Pressable>
        <Pressable style={styles.quickButton} onPress={() => navigation.navigate("Goal")}>
          <Text style={styles.quickButtonText}>🏦 Mục tiêu</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
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
    gap: 12
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 5,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  cardLabel: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 6
  },
  cardValue: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 20
  },
  quickGrid: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  quickButton: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 12,
    alignItems: "center"
  },
  quickButtonText: {
    color: "#0f172a",
    fontWeight: "700"
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700"
  }
});
