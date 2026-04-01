import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { SUCCESS_ALERT_MESSAGES, SUCCESS_ALERT_TITLE } from "../constants/alertMessages";
import { formatDate, formatMoney, getApiErrorMessage } from "../utils/format";
import IncomeExpenseChart from "../components/IncomeExpenseChart";

function ExpenseItem({ item, onDelete }) {
  const amount = Number(item?.amount || 0);

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemMain}>
        <View style={styles.iconBubble}>
          <Text style={styles.iconText}>{item?.icon || "💸"}</Text>
        </View>

        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item?.name || "Chi tiêu"}</Text>
          <Text style={styles.itemMeta}>{formatDate(item?.date)} • {item?.categoryName || "Khác"}</Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <Text style={styles.itemAmount}>- {formatMoney(amount)}</Text>
        <Pressable onPress={() => onDelete(item?.id)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ExpenseScreen() {
  const navigation = useNavigation();
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [expenses]);

  const fetchExpenses = useCallback(async () => {
    const response = await http.get(API_ENDPOINTS.GET_ALL_EXPENSE);
    setExpenses(Array.isArray(response.data) ? response.data : []);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchExpenses();
    } catch (error) {
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được danh sách chi tiêu"));
    } finally {
      setRefreshing(false);
    }
  }, [fetchExpenses]);

  const onDelete = async (id) => {
    if (!id) return;

    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa khoản chi này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await http.delete(API_ENDPOINTS.DELETE_EXPENSE(id));
            await fetchExpenses();
            Alert.alert(SUCCESS_ALERT_TITLE, SUCCESS_ALERT_MESSAGES.delete.expense);
          } catch (error) {
            Alert.alert("Xóa thất bại", getApiErrorMessage(error, "Không thể xóa khoản chi này"));
          }
        }
      }
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Tổng chi tiêu</Text>
          <Text style={styles.summaryAmount}>{formatMoney(totalExpense)}</Text>
          <Text style={styles.summaryHint}>{expenses.length} giao dịch</Text>
        </View>

        <Pressable style={styles.addButton} onPress={() => navigation.navigate("AddExpense")}>
          <Text style={styles.addButtonText}>+ Thêm chi tiêu</Text>
        </Pressable>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <ExpenseItem item={item} onDelete={onDelete} />}
        contentContainerStyle={[styles.listContent, !expenses.length && styles.listContentEmpty]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          expenses.length ? (
            <View>
              <IncomeExpenseChart data={expenses} title="Tổng quan chi tiêu" colorPrimary="#b42318" />
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Danh sách chi tiêu</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyTitle}>Chưa có khoản chi nào</Text>
            <Text style={styles.emptyText}>Hãy thêm giao dịch đầu tiên để bắt đầu theo dõi chi tiêu dễ hơn.</Text>
            <Pressable style={styles.emptyAction} onPress={() => navigation.navigate("AddExpense")}>
              <Text style={styles.emptyActionText}>+ Thêm chi tiêu</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
    padding: 16,
    paddingTop: 50
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e4e7ec",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  summaryContent: {
    alignItems: "center"
  },
  summaryLabel: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "700"
  },
  summaryAmount: {
    marginTop: 4,
    fontSize: 26,
    color: "#b42318",
    fontWeight: "800"
  },
  summaryHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#667085"
  },
  addButton: {
    marginTop: 12,
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#0f766e",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  },
  listContent: {
    paddingBottom: 24
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center"
  },
  listHeader: {
    marginBottom: 8
  },
  listTitle: {
    color: "#101828",
    fontWeight: "800",
    fontSize: 16
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e4e7ec",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  itemMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f2f4f7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  iconText: {
    fontSize: 18
  },
  itemContent: {
    flex: 1
  },
  itemName: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 15
  },
  itemMeta: {
    marginTop: 4,
    color: "#667085",
    fontSize: 12
  },
  itemRight: {
    alignItems: "flex-end"
  },
  itemAmount: {
    color: "#b42318",
    fontWeight: "800"
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: "#fef3f2",
    borderColor: "#fecdca",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  deleteText: {
    color: "#b42318",
    fontWeight: "700",
    fontSize: 12
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#101828",
    marginBottom: 6
  },
  emptyText: {
    textAlign: "center",
    color: "#667085",
    lineHeight: 19,
    marginBottom: 14
  },
  emptyAction: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  emptyActionText: {
    color: "#ffffff",
    fontWeight: "800"
  }
});
