import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { SUCCESS_ALERT_MESSAGES, SUCCESS_ALERT_TITLE } from "../constants/alertMessages";
import { getApiErrorMessage } from "../utils/format";
import { CategoryVectorIcon, getCategoryIconPresets, getFirstCategoryIcon, getIconLabel } from "../utils/VectorIcons";

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

function CategoryItem({ item, onEditIcon, onDelete }) {
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
          <CategoryVectorIcon iconValue={item?.icon} size={18} style={styles.itemIconText} />
        </View>
        <Text style={styles.itemName}>{item?.name || "Chưa đặt tên"}</Text>
      </View>

      <View style={styles.itemRight}>
        <View style={[styles.typeChip, { backgroundColor: meta.chipBg }]}>
          <Text style={[styles.typeChipText, { color: meta.chipText }]}>{meta.label}</Text>
        </View>

        <View style={styles.itemActionRow}>
          <Pressable style={styles.itemEditBtn} onPress={() => onEditIcon(item)}>
            <Text style={styles.itemEditText}>Sửa icon</Text>
          </Pressable>
          <Pressable style={styles.itemDeleteBtn} onPress={() => onDelete(item)}>
            <Text style={styles.itemDeleteText}>Xóa</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("income");
  const [selectedIcon, setSelectedIcon] = useState(getFirstCategoryIcon("income"));
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editIcon, setEditIcon] = useState(getFirstCategoryIcon("income"));
  const [editingIconSaving, setEditingIconSaving] = useState(false);

  const iconOptions = useMemo(() => getCategoryIconPresets(type), [type]);
  const editIconOptions = useMemo(() => {
    const editType = String(editingCategory?.type || "").toLowerCase();
    if (!editType) return [];
    return getCategoryIconPresets(editType);
  }, [editingCategory]);

  useEffect(() => {
    const hasSelectedIcon = iconOptions.some((option) => option.value === selectedIcon);
    if (!hasSelectedIcon) {
      setSelectedIcon(getFirstCategoryIcon(type));
    }
  }, [iconOptions, selectedIcon, type]);

  const formHint = useMemo(() => {
    if (type === "income") {
      return "Gợi ý: Lương, Freelance, Thưởng...";
    }
    return "Gợi ý: Ăn uống, Di chuyển, Giải trí...";
  }, [type]);

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
        icon: selectedIcon,
        type
      });

      setName("");
      setType("income");
      setSelectedIcon(getFirstCategoryIcon("income"));
      setIsIconDropdownOpen(false);
      await fetchCategories();
      Alert.alert(SUCCESS_ALERT_TITLE, SUCCESS_ALERT_MESSAGES.create.category);
    } catch (error) {
      Alert.alert("Lưu thất bại", getApiErrorMessage(error, "Không thể thêm danh mục"));
    } finally {
      setSaving(false);
    }
  };

  const onOpenEditIcon = (category) => {
    if (!category?.id) return;
    setEditingCategory(category);
    setEditIcon(String(category.icon || getFirstCategoryIcon(String(category.type || "expense").toLowerCase())));
  };

  const onCloseEditIcon = () => {
    setEditingCategory(null);
    setEditIcon(getFirstCategoryIcon("income"));
    setEditingIconSaving(false);
  };

  const onUpdateCategoryIcon = async () => {
    if (!editingCategory?.id) return;
    setEditingIconSaving(true);
    try {
      await http.put(API_ENDPOINTS.UPDATE_CATEGORY(editingCategory.id), {
        name: editingCategory.name,
        type: editingCategory.type,
        icon: editIcon
      });
      await fetchCategories();
      onCloseEditIcon();
      Alert.alert(SUCCESS_ALERT_TITLE, "Đã cập nhật icon danh mục thành công.");
    } catch (error) {
      Alert.alert("Cập nhật thất bại", getApiErrorMessage(error, "Không thể cập nhật icon danh mục"));
      setEditingIconSaving(false);
    }
  };

  const deleteRelatedByCategory = async (category) => {
    const categoryId = Number(category?.id);
    const normalizedType = String(category?.type || "").toLowerCase();

    if (!Number.isFinite(categoryId)) return;

    if (normalizedType === "expense") {
      const expenseRes = await http.get(API_ENDPOINTS.GET_ALL_EXPENSE);
      const expenses = Array.isArray(expenseRes.data) ? expenseRes.data : [];
      const targetExpenses = expenses.filter((item) => Number(item?.categoryId) === categoryId);

      for (const expense of targetExpenses) {
        await http.delete(API_ENDPOINTS.DELETE_EXPENSE(expense.id));
      }

      const budgetRes = await http.get(API_ENDPOINTS.GET_BUDGETS);
      const budgets = Array.isArray(budgetRes.data) ? budgetRes.data : [];
      const targetBudgets = budgets.filter((item) => Number(item?.categoryId) === categoryId);

      for (const budget of targetBudgets) {
        await http.delete(API_ENDPOINTS.DELETE_BUDGET(budget.id));
      }
    }

    if (normalizedType === "income") {
      const incomeRes = await http.get(API_ENDPOINTS.GET_ALL_INCOMES);
      const incomes = Array.isArray(incomeRes.data) ? incomeRes.data : [];
      const targetIncomes = incomes.filter((item) => Number(item?.categoryId) === categoryId);

      for (const income of targetIncomes) {
        await http.delete(API_ENDPOINTS.DELETE_INCOME(income.id));
      }
    }
  };

  const onDeleteCategory = (category) => {
    if (!category?.id) return;

    Alert.alert(
      "Xác nhận xóa",
      "Hệ thống sẽ xóa giao dịch liên quan trước, sau đó xóa danh mục. Bạn muốn tiếp tục?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRelatedByCategory(category);
              await http.delete(API_ENDPOINTS.DELETE_CATEGORY(category.id));
              await fetchCategories();
              Alert.alert(SUCCESS_ALERT_TITLE, "Đã xóa danh mục thành công.");
            } catch (error) {
              Alert.alert("Xóa thất bại", getApiErrorMessage(error, "Không thể xóa danh mục"));
            }
          }
        }
      ]
    );
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

        <Text style={styles.inputLabel}>Loại danh mục</Text>
        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeButton, styles.typeButtonLeft, type === "income" && styles.typeButtonActiveIncome]}
            onPress={() => {
              setType("income");
            }}
          >
            <Text style={[styles.typeText, type === "income" && styles.typeTextActive]}>Thu nhập</Text>
          </Pressable>
          <Pressable
            style={[styles.typeButton, type === "expense" && styles.typeButtonActiveExpense]}
            onPress={() => {
              setType("expense");
            }}
          >
            <Text style={[styles.typeText, type === "expense" && styles.typeTextActive]}>Chi tiêu</Text>
          </Pressable>
        </View>

        <Text style={styles.hintText}>{formHint}</Text>

        <Text style={styles.inputLabel}>Icon</Text>
        <View style={styles.iconSelectorWrapper}>
          <Pressable
            style={styles.iconDropdownTrigger}
            onPress={() => {
              setIsIconDropdownOpen((prev) => !prev);
            }}
          >
            <View style={styles.iconTriggerLeft}>
              <View style={styles.iconPreviewBubble}>
                <CategoryVectorIcon iconValue={selectedIcon} size={20} />
              </View>
              <Text style={styles.iconTriggerText}>{getIconLabel(selectedIcon)}</Text>
            </View>
            <Text style={styles.iconTriggerChevron}>{isIconDropdownOpen ? "▲" : "▼"}</Text>
          </Pressable>

          {isIconDropdownOpen ? (
            <View style={styles.iconDropdownList}>
              <FlatList
                data={iconOptions}
                keyExtractor={(item) => item.value}
                nestedScrollEnabled
                style={styles.iconDropdownScroll}
                contentContainerStyle={styles.iconDropdownContent}
                renderItem={({ item }) => {
                  const isActive = item.value === selectedIcon;
                  return (
                    <Pressable
                      style={[styles.iconOption, isActive && styles.iconOptionActive]}
                      onPress={() => {
                        setSelectedIcon(item.value);
                        setIsIconDropdownOpen(false);
                      }}
                    >
                      <View style={styles.iconOptionLeft}>
                        <View style={styles.iconOptionBubble}>
                          <CategoryVectorIcon iconValue={item.value} size={18} />
                        </View>
                        <Text style={styles.iconOptionLabel}>{item.label}</Text>
                      </View>
                      {isActive ? <Text style={styles.iconOptionCheck}>✓</Text> : null}
                    </Pressable>
                  );
                }}
              />
            </View>
          ) : null}
        </View>

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={onSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Đang lưu..." : "Thêm danh mục"}</Text>
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => <CategoryItem item={item} onEditIcon={onOpenEditIcon} onDelete={onDeleteCategory} />}
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

      <Modal visible={Boolean(editingCategory)} transparent animationType="slide" onRequestClose={onCloseEditIcon}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sửa icon danh mục</Text>
            <Text style={styles.modalSubTitle}>{editingCategory?.name}</Text>

            <View style={styles.modalIconPreview}>
              <CategoryVectorIcon iconValue={editIcon} size={24} />
              <Text style={styles.modalIconLabel}>{getIconLabel(editIcon)}</Text>
            </View>

            <FlatList
              data={editIconOptions}
              keyExtractor={(item) => item.value}
              numColumns={3}
              style={styles.modalIconList}
              columnWrapperStyle={styles.modalIconRow}
              renderItem={({ item }) => {
                const active = item.value === editIcon;
                return (
                  <Pressable style={[styles.modalIconItem, active && styles.modalIconItemActive]} onPress={() => setEditIcon(item.value)}>
                    <CategoryVectorIcon iconValue={item.value} size={20} />
                    <Text style={styles.modalIconItemLabel}>{item.label}</Text>
                  </Pressable>
                );
              }}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancelBtn} onPress={onCloseEditIcon} disabled={editingIconSaving}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSaveBtn, editingIconSaving && styles.saveButtonDisabled]}
                onPress={onUpdateCategoryIcon}
                disabled={editingIconSaving}
              >
                <Text style={styles.modalSaveText}>{editingIconSaving ? "Đang lưu..." : "Lưu icon"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  iconSelectorWrapper: { marginBottom: 12 },
  iconDropdownTrigger: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  iconTriggerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconPreviewBubble: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e4e7ec",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  iconTriggerText: {
    color: "#344054",
    fontWeight: "600"
  },
  iconTriggerChevron: { color: "#667085", fontSize: 12, fontWeight: "800" },
  iconDropdownList: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    backgroundColor: "#fff",
    maxHeight: 220
  },
  iconDropdownScroll: { maxHeight: 220 },
  iconDropdownContent: { paddingVertical: 6 },
  iconOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 10
  },
  iconOptionActive: { backgroundColor: "#ecfdf3" },
  iconOptionLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconOptionBubble: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#f2f4f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  iconOptionLabel: { color: "#101828", fontWeight: "600" },
  iconOptionCheck: { color: "#067647", fontWeight: "800" },
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
  itemIconText: { fontSize: 18 },
  itemName: { color: "#0f172a", fontWeight: "700", fontSize: 15, flexShrink: 1 },
  itemRight: { alignItems: "flex-end" },
  typeChip: { borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  typeChipText: { fontWeight: "800", fontSize: 12 },
  itemActionRow: { flexDirection: "row", marginTop: 8 },
  itemEditBtn: {
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#dbe8ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6
  },
  itemEditText: { color: "#175cd3", fontSize: 12, fontWeight: "700" },
  itemDeleteBtn: {
    backgroundColor: "#fef3f2",
    borderWidth: 1,
    borderColor: "#fecdca",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  itemDeleteText: { color: "#b42318", fontSize: 12, fontWeight: "700" },
  emptyState: { alignItems: "center", marginTop: 44, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#101828", marginBottom: 6 },
  emptyText: { textAlign: "center", color: "#667085", lineHeight: 19 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 16
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    maxHeight: "80%"
  },
  modalTitle: { color: "#0f172a", fontWeight: "800", fontSize: 18 },
  modalSubTitle: { color: "#667085", marginTop: 2, marginBottom: 10 },
  modalIconPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  modalIconLabel: { marginLeft: 8, color: "#344054", fontWeight: "600" },
  modalIconList: { maxHeight: 300 },
  modalIconRow: { justifyContent: "space-between" },
  modalIconItem: {
    width: "32%",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#fff"
  },
  modalIconItemActive: { borderColor: "#12b76a", backgroundColor: "#ecfdf3" },
  modalIconItemLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#344054",
    textAlign: "center"
  },
  modalActions: { marginTop: 8, flexDirection: "row", justifyContent: "flex-end" },
  modalCancelBtn: {
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8
  },
  modalCancelText: { color: "#344054", fontWeight: "700" },
  modalSaveBtn: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  modalSaveText: { color: "#fff", fontWeight: "700" }
});
