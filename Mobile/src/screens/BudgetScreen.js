import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { formatMoney, getApiErrorMessage } from "../utils/format";

function getBudgetVisual(progressRatio) {
  if (progressRatio >= 1) {
    return {
      color: "#b42318",
      bg: "#fef3f2",
      border: "#fecdca",
      label: "Vượt hạn mức"
    };
  }

  if (progressRatio >= 0.8) {
    return {
      color: "#b54708",
      bg: "#fffaeb",
      border: "#fedf89",
      label: "Sắp chạm hạn mức"
    };
  }

  return {
    color: "#067647",
    bg: "#ecfdf3",
    border: "#abefc6",
    label: "Trong giới hạn"
  };
}

function CategoryChip({ category, active, onPress }) {
  const icon = typeof category?.icon === "string" && category.icon.trim().length <= 3 ? category.icon : "📂";

  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {category?.name || "Danh mục"}
      </Text>
    </Pressable>
  );
}

function BudgetCard({ item, onDelete }) {
  const limit = Number(item?.amountLimit || 0);
  const spent = Number(item?.totalSpent || 0);
  const ratio = limit > 0 ? spent / limit : 0;
  const progress = Math.min(100, ratio * 100);
  const visual = getBudgetVisual(ratio);

  const now = new Date();
  const month = Number(item?.month || now.getMonth() + 1);
  const year = Number(item?.year || now.getFullYear());

  const icon = typeof item?.categoryIcon === "string" && item.categoryIcon.trim().length <= 3 ? item.categoryIcon : "📂";

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderLeft}>
          <View style={styles.itemIconBubble}>
            <Text style={styles.itemIconText}>{icon}</Text>
          </View>
          <View style={styles.itemHeaderTextWrap}>
            <Text style={styles.itemName}>{item?.categoryName || "Ngân sách"}</Text>
            <Text style={styles.itemSubTitle}>Tháng {month}/{year}</Text>
          </View>
        </View>

        <Pressable style={styles.deleteButton} onPress={() => onDelete(item?.id)}>
          <Text style={styles.deleteText}>Xóa</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Đã chi</Text>
          <Text style={styles.statValue}>{formatMoney(spent)}</Text>
        </View>
        <View style={styles.statRight}>
          <Text style={styles.statLabel}>Hạn mức</Text>
          <Text style={styles.statValue}>{formatMoney(limit)}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: visual.color }]} />
      </View>

      <View style={styles.progressFooter}>
        <View style={[styles.statusBadge, { backgroundColor: visual.bg, borderColor: visual.border }]}>
          <Text style={[styles.statusBadgeText, { color: visual.color }]}>{visual.label}</Text>
        </View>
        <Text style={[styles.progressPercent, { color: visual.color }]}>{progress.toFixed(0)}%</Text>
      </View>
    </View>
  );
}

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const [categoryId, setCategoryId] = useState("");
  const [amountLimit, setAmountLimit] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [submitting, setSubmitting] = useState(false);

  const summary = useMemo(() => {
    const totalLimit = budgets.reduce((sum, item) => sum + Number(item?.amountLimit || 0), 0);
    const totalSpent = budgets.reduce((sum, item) => sum + Number(item?.totalSpent || 0), 0);
    const warningCount = budgets.filter((item) => {
      const limit = Number(item?.amountLimit || 0);
      const spent = Number(item?.totalSpent || 0);
      return limit > 0 && spent / limit >= 0.8;
    }).length;

    return {
      totalLimit,
      totalSpent,
      warningCount
    };
  }, [budgets]);

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
    const selectedMonth = Number(month);
    const selectedYear = Number(year);

    if (!categoryId) {
      Alert.alert("Thiếu danh mục", "Vui lòng chọn danh mục.");
      return;
    }

    if (!Number.isFinite(limit) || limit <= 0) {
      Alert.alert("Sai dữ liệu", "Vui lòng nhập hạn mức hợp lệ > 0.");
      return;
    }

    if (!Number.isFinite(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
      Alert.alert("Sai tháng", "Tháng cần nằm trong khoảng 1 đến 12.");
      return;
    }

    if (!Number.isFinite(selectedYear) || selectedYear < 2000 || selectedYear > 2100) {
      Alert.alert("Sai năm", "Năm không hợp lệ.");
      return;
    }

    setSubmitting(true);
    try {
      await http.post(API_ENDPOINTS.SET_BUDGET, {
        categoryId: Number(categoryId),
        amountLimit: limit,
        month: selectedMonth,
        year: selectedYear
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

    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa hạn mức này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await http.delete(API_ENDPOINTS.DELETE_BUDGET(id));
            await fetchData();
          } catch (error) {
            Alert.alert("Xóa thất bại", getApiErrorMessage(error, "Không thể xóa ngân sách"));
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>Ngân sách tháng</Text>
        <Text style={styles.overviewLimit}>Hạn mức: {formatMoney(summary.totalLimit)}</Text>
        <Text style={styles.overviewSpent}>Đã chi: {formatMoney(summary.totalSpent)}</Text>
        <Text style={styles.overviewHint}>{summary.warningCount} mục đang gần/vượt hạn mức</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Thiết lập hạn mức</Text>
        <Text style={styles.formSubTitle}>Chọn danh mục chi tiêu và nhập giới hạn theo tháng.</Text>

        <Text style={styles.label}>Danh mục chi</Text>
        <View style={styles.chipRow}>
          {categories.map((category) => {
            const active = String(category.id) === String(categoryId);
            return (
              <CategoryChip
                key={String(category.id)}
                category={category}
                active={active}
                onPress={() => setCategoryId(String(category.id))}
              />
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
          placeholderTextColor="#98a2b3"
        />

        <View style={styles.dateRow}>
          <View style={[styles.dateCol, styles.dateColLeft]}>
            <Text style={styles.label}>Tháng</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={month}
              onChangeText={setMonth}
              placeholder="1-12"
              placeholderTextColor="#98a2b3"
            />
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.label}>Năm</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={year}
              onChangeText={setYear}
              placeholder="2026"
              placeholderTextColor="#98a2b3"
            />
          </View>
        </View>

        <Pressable style={[styles.saveButton, submitting && styles.saveButtonDisabled]} onPress={onSave} disabled={submitting}>
          <Text style={styles.saveButtonText}>{submitting ? "Đang lưu..." : "Lưu hạn mức"}</Text>
        </Pressable>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <BudgetCard item={item} onDelete={onDelete} />}
        contentContainerStyle={[styles.listContent, !budgets.length && styles.listContentEmpty]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          budgets.length ? (
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Danh sách hạn mức</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyTitle}>Chưa có hạn mức nào</Text>
            <Text style={styles.emptyText}>Hãy tạo hạn mức đầu tiên để kiểm soát chi tiêu tốt hơn trong tháng.</Text>
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
    paddingTop: 24
  },
  overviewCard: {
    backgroundColor: "#0e3642",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12
  },
  overviewTitle: {
    color: "#cbd5e1",
    fontWeight: "700",
    fontSize: 13
  },
  overviewLimit: {
    marginTop: 6,
    color: "#d61010",
    fontWeight: "800",
    fontSize: 20
  },
  overviewSpent: {
    marginTop: 2,
    color: "#fecaca",
    fontWeight: "700"
  },
  overviewHint: {
    marginTop: 8,
    color: "#94a3b8",
    fontSize: 12
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e4e7ec",
    padding: 12,
    marginBottom: 12
  },
  formTitle: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 4
  },
  formSubTitle: {
    color: "#667085",
    marginBottom: 10,
    fontSize: 12
  },
  label: {
    color: "#344054",
    marginBottom: 6,
    fontWeight: "700"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10
  },
  chip: {
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "48%"
  },
  chipActive: {
    borderColor: "#0f766e",
    backgroundColor: "#ccfbf1"
  },
  chipIcon: {
    marginRight: 5
  },
  chipText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1
  },
  chipTextActive: {
    color: "#115e59",
    fontWeight: "800"
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
    color: "#101828"
  },
  dateRow: {
    flexDirection: "row"
  },
  dateCol: {
    flex: 1
  },
  dateColLeft: {
    marginRight: 8
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
    fontWeight: "800"
  },
  listContent: {
    paddingBottom: 30
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
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  itemHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8
  },
  itemIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f2f4f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  itemIconText: {
    fontSize: 18
  },
  itemHeaderTextWrap: {
    flex: 1
  },
  itemName: {
    color: "#0f172a",
    fontWeight: "800",
    marginBottom: 2
  },
  itemSubTitle: {
    color: "#667085",
    fontSize: 12
  },
  deleteButton: {
    backgroundColor: "#fef3f2",
    borderWidth: 1,
    borderColor: "#fecdca",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  deleteText: {
    color: "#b42318",
    fontWeight: "700",
    fontSize: 12
  },
  statsRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statRight: {
    alignItems: "flex-end"
  },
  statLabel: {
    color: "#667085",
    fontSize: 12
  },
  statValue: {
    color: "#0f172a",
    marginTop: 2,
    fontWeight: "700"
  },
  progressTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%"
  },
  progressFooter: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700"
  },
  progressPercent: {
    fontWeight: "800"
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
    lineHeight: 19
  }
});
