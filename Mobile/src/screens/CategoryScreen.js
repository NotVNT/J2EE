import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { getApiErrorMessage } from "../utils/format";

const DEFAULT_ICON = "📁";
const ICON_PRESETS = {
  income: ["💵", "💼", "🎁", "🏦", "📈"],
  expense: ["🍜", "🛒", "🚗", "🏠", "💊"]
};

const TYPE_META = {
  expense: {
    label: "Chi tiêu",
    chipBg: "#fef2f2",
    chipText: "#b42318"
  },
  income: {
    label: "Thu nhập",
    chipBg: "#ecfdf3",
    chipText: "#067647"
  }
};

function CategoryItem({ item }) {
  const normalizedType = String(item?.type || "").toLowerCase();
  const meta = TYPE_META[normalizedType] || {
    label: (item?.type || "-").toString().toUpperCase(),
    chipBg: "#f1f5f9",
    chipText: "#475467"
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIconBubble}>
          <Text style={styles.itemIconText}>{item?.icon || DEFAULT_ICON}</Text>
        </View>
        <Text style={styles.itemName}>{item?.name || "Chưa đặt tên"}</Text>
      </View>

      <View style={[styles.typeChip, { backgroundColor: meta.chipBg }]}>
        <Text style={[styles.typeChipText, { color: meta.chipText }]}>{meta.label}</Text>
      </View>
    </View>
  );
}

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [type, setType] = useState("income");
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);

  const formHint = useMemo(() => {
    if (type === "income") {
      return "Gợi ý: Lương, Freelance, Thưởng...";
    }
    return "Gợi ý: Ăn uống, Di chuyển, Giải trí...";
  }, [type]);
  const currentIconPresets = ICON_PRESETS[type] || ICON_PRESETS.expense;

  const fetchCategories = useCallback(async () => {
    const response = await http.get(API_ENDPOINTS.GET_ALL_CATEGORIES);
    setCategories(Array.isArray(response.data) ? response.data : []);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
    } catch (error) {
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được danh mục"));
    } finally {
      setRefreshing(false);
    }
  }, [fetchCategories]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const onSave = async () => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập tên danh mục.");
      return;
    }

    const isDuplicate = categories.some((category) => {
      return String(category?.name || "").trim().toLowerCase() === normalizedName.toLowerCase();
    });
    if (isDuplicate) {
      Alert.alert("Trùng danh mục", "Tên danh mục đã tồn tại.");
      return;
    }

    setSaving(true);
    try {
      await http.post(API_ENDPOINTS.ADD_CATEGORY, {
        name: normalizedName,
        icon: icon.trim() || DEFAULT_ICON,
        type
      });

      setName("");
      setIcon(DEFAULT_ICON);
      setType("income");
      setIsIconDropdownOpen(false);
      await fetchCategories();
    } catch (error) {
      Alert.alert("Lưu thất bại", getApiErrorMessage(error, "Không thể thêm danh mục"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Thêm danh mục</Text>
        <Text style={styles.formSubtitle}>Tạo nhóm giao dịch rõ ràng để theo dõi chi tiêu tốt hơn.</Text>

        <Text style={styles.inputLabel}>Tên danh mục</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ví dụ: Ăn uống"
          placeholderTextColor="#98a2b3"
        />

        <Text style={styles.inputLabel}>Biểu tượng</Text>
        <Pressable style={styles.dropdownTrigger} onPress={() => setIsIconDropdownOpen((prev) => !prev)}>
          <View style={styles.dropdownTriggerLeft}>
            <View style={styles.selectedIconBubble}>
              <Text style={styles.selectedIconText}>{icon || DEFAULT_ICON}</Text>
            </View>
            <Text style={styles.dropdownSelectedText}>Chọn biểu tượng</Text>
          </View>
          <Text style={styles.dropdownArrow}>{isIconDropdownOpen ? "▲" : "▼"}</Text>
        </Pressable>

        {isIconDropdownOpen ? (
          <View style={styles.dropdownMenu}>
            {currentIconPresets.map((quickIcon) => {
              const active = quickIcon === icon;
              return (
                <Pressable
                  key={quickIcon}
                  onPress={() => {
                    setIcon(quickIcon);
                    setIsIconDropdownOpen(false);
                  }}
                  style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                >
                  <Text style={styles.dropdownItemIcon}>{quickIcon}</Text>
                  <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>Biểu tượng {quickIcon}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Text style={styles.inputLabel}>Loại danh mục</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeButton, styles.typeButtonLeft, type === "income" && styles.typeButtonActiveIncome]}
            onPress={() => {
              setType("income");
              setIcon((prev) => (ICON_PRESETS.income.includes(prev) ? prev : ICON_PRESETS.income[0]));
            }}
          >
            <Text style={[styles.typeText, type === "income" && styles.typeTextActive]}>Thu nhập</Text>
          </Pressable>
          <Pressable
            style={[styles.typeButton, type === "expense" && styles.typeButtonActiveExpense]}
            onPress={() => {
              setType("expense");
              setIcon((prev) => (ICON_PRESETS.expense.includes(prev) ? prev : ICON_PRESETS.expense[0]));
            }}
          >
            <Text style={[styles.typeText, type === "expense" && styles.typeTextActive]}>Chi tiêu</Text>
          </Pressable>
        </View>

        <Text style={styles.hintText}>{formHint}</Text>

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={onSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Đang lưu..." : "Thêm danh mục"}</Text>
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <CategoryItem item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          categories.length ? (
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Danh sách danh mục</Text>
              <Text style={styles.listCount}>{categories.length}</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.emptyTitle}>Chưa có danh mục nào</Text>
            <Text style={styles.emptyText}>Tạo danh mục đầu tiên để bắt đầu quản lý giao dịch gọn gàng hơn.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, 
    backgroundColor: "#f2f4f7", 
    padding: 16,
    paddingTop: 50
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e4e7ec",
    padding: 14,
    marginBottom: 14,
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  formTitle: { color: "#0f172a", fontWeight: "800", fontSize: 22, marginBottom: 4 },
  formSubtitle: { color: "#475467", fontSize: 13, lineHeight: 18, marginBottom: 12 },
  inputLabel: { color: "#344054", fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    color: "#101828"
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  dropdownTriggerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  selectedIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  selectedIconText: {
    fontSize: 20
  },
  dropdownSelectedText: {
    marginLeft: 10,
    color: "#344054",
    fontWeight: "700"
  },
  dropdownArrow: {
    color: "#344054",
    fontWeight: "700",
    fontSize: 12
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
    overflow: "hidden"
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f4f7"
  },
  dropdownItemActive: {
    backgroundColor: "#ecfdf3"
  },
  dropdownItemIcon: {
    fontSize: 18,
    marginRight: 10
  },
  dropdownItemText: {
    color: "#344054",
    fontWeight: "600"
  },
  dropdownItemTextActive: {
    color: "#067647",
    fontWeight: "700"
  },
  typeRow: {
    flexDirection: "row",
    marginBottom: 8
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    alignItems: "center"
  },
  typeButtonLeft: {
    marginRight: 10
  },
  typeButtonActiveExpense: {
    borderColor: "#f97066",
    backgroundColor: "#fef3f2"
  },
  typeButtonActiveIncome: {
    borderColor: "#32d583",
    backgroundColor: "#ecfdf3"
  },
  typeText: { color: "#344054", fontWeight: "700" },
  typeTextActive: { color: "#101828" },
  hintText: { color: "#667085", marginBottom: 12, fontSize: 12 },
  saveButton: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: "#0f766e",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  listTitle: { color: "#101828", fontWeight: "800", fontSize: 16 },
  listCount: {
    minWidth: 24,
    textAlign: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#ecfdf3",
    color: "#067647",
    fontWeight: "800"
  },
  listContent: { paddingBottom: 24 },
  itemCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e7ec",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10
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
  itemName: { color: "#0f172a", fontWeight: "700", fontSize: 15, flexShrink: 1 },
  typeChip: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  typeChipText: { fontWeight: "800", fontSize: 12 },
  emptyState: { alignItems: "center", marginTop: 44, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#101828", marginBottom: 6 },
  emptyText: { textAlign: "center", color: "#667085", lineHeight: 19 }
});
