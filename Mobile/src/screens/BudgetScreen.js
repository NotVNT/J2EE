import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { formatMoney, getApiErrorMessage } from "../utils/format";

function BudgetCard({ item, onDelete }) {
  const limit = Number(item?.amountLimit || 0);
  const spent = Number(item?.totalSpent || 0);
  const progress = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const danger = progress >= 80;

  return (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item?.categoryName || "Ngân sách"}</Text>
      <Text style={styles.itemText}>Hạn mức: {formatMoney(limit)}</Text>
      <Text style={styles.itemText}>Đã chi: {formatMoney(spent)}</Text>

      <View style={styles.progressOuter}>
        <View style={[styles.progressInner, { width: `${progress}%`, backgroundColor: danger ? "#dc2626" : "#0f766e" }]} />
      </View>

      <View style={styles.itemFooter}>
        <Text style={[styles.progressText, danger && styles.progressDanger]}>{progress.toFixed(0)}%</Text>
        <Pressable onPress={() => onDelete(item?.id)}>
          <Text style={styles.deleteText}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [amountLimit, setAmountLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    const [budgetRes, categoryRes] = await Promise.all([
      http.get(API_ENDPOINTS.GET_BUDGETS),
      http.get(API_ENDPOINTS.CATEGORY_BY_TYPE("expense"))
    ]);

    const budgetData = Array.isArray(budgetRes.data) ? budgetRes.data : [];
    const categoryData = Array.isArray(categoryRes.data) ? categoryRes.data : [];

    setBudgets(budgetData);
    setCategories(categoryData);

    if (categoryData.length > 0 && !categoryId) {
      setCategoryId(String(categoryData[0].id));
    }
  }, [categoryId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được dữ liệu ngân sách"));
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const onSave = async () => {
    const limit = Number(amountLimit);

    if (!categoryId) {
      Alert.alert("Thiếu danh mục", "Vui lòng chọn danh mục.");
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      Alert.alert("Sai dữ liệu", "Vui lòng nhập hạn mức hợp lệ > 0.");
      return;
    }

    setSubmitting(true);
    try {
      await http.post(API_ENDPOINTS.SET_BUDGET, {
        categoryId: Number(categoryId),
        amountLimit: limit
      });

      setAmountLimit("");
      await fetchData();
    } catch (error) {
      Alert.alert("Lưu thất bại", getApiErrorMessage(error, "Không thể cập nhật ngân sách"));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;

    try {
      await http.delete(API_ENDPOINTS.DELETE_BUDGET(id));
      await fetchData();
    } catch (error) {
      Alert.alert("Xóa thất bại", getApiErrorMessage(error, "Không thể xóa ngân sách"));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Thiết lập ngân sách</Text>

        <Text style={styles.label}>Danh mục chi</Text>
        <View style={styles.chipRow}>
          {categories.map((category) => {
            const active = String(category.id) === String(categoryId);
            return (
              <Pressable
                key={String(category.id)}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCategoryId(String(category.id))}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{category.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Hạn mức (VND)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amountLimit}
          onChangeText={setAmountLimit}
          placeholder="Ví dụ: 3000000"
        />

        <Pressable style={[styles.saveButton, submitting && styles.saveButtonDisabled]} onPress={onSave} disabled={submitting}>
          <Text style={styles.saveButtonText}>{submitting ? "Đang lưu..." : "Lưu ngân sách"}</Text>
        </Pressable>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <BudgetCard item={item} onDelete={onDelete} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có ngân sách nào</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 12
  },
  formTitle: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10
  },
  label: {
    color: "#334155",
    marginBottom: 6,
    fontWeight: "600"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10
  },
  chip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#fff"
  },
  chipActive: {
    borderColor: "#0f766e",
    backgroundColor: "#ccfbf1"
  },
  chipText: { color: "#334155" },
  chipTextActive: { color: "#115e59", fontWeight: "700" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10
  },
  saveButton: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700"
  },
  listContent: {
    gap: 10,
    paddingBottom: 30
  },
  item: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12
  },
  itemName: { color: "#0f172a", fontWeight: "700", marginBottom: 6 },
  itemText: { color: "#475569", marginBottom: 2 },
  progressOuter: {
    marginTop: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    overflow: "hidden"
  },
  progressInner: {
    height: "100%"
  },
  itemFooter: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  progressText: {
    color: "#0f766e",
    fontWeight: "700"
  },
  progressDanger: {
    color: "#dc2626"
  },
  deleteText: {
    color: "#ef4444",
    fontWeight: "700"
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 20
  }
});
