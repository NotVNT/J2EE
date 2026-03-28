import React, { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { getApiErrorMessage } from "../utils/format";

function CategoryItem({ item }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item?.icon || "📁"} {item?.name}</Text>
      <Text style={styles.itemType}>{item?.type || "-"}</Text>
    </View>
  );
}

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [type, setType] = useState("expense");

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
    if (!name.trim()) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập tên danh mục.");
      return;
    }

    setSaving(true);
    try {
      await http.post(API_ENDPOINTS.ADD_CATEGORY, {
        name: name.trim(),
        icon: icon.trim() || "📁",
        type
      });

      setName("");
      setIcon("📁");
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

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tên danh mục"
        />

        <TextInput
          style={styles.input}
          value={icon}
          onChangeText={setIcon}
          placeholder="Biểu tượng (vd: 🍜)"
        />

        <View style={styles.typeRow}>
          <Pressable
            style={[styles.typeButton, type === "expense" && styles.typeButtonActiveExpense]}
            onPress={() => setType("expense")}
          >
            <Text style={[styles.typeText, type === "expense" && styles.typeTextActive]}>Chi tiêu</Text>
          </Pressable>
          <Pressable
            style={[styles.typeButton, type === "income" && styles.typeButtonActiveIncome]}
            onPress={() => setType("income")}
          >
            <Text style={[styles.typeText, type === "income" && styles.typeTextActive]}>Thu nhập</Text>
          </Pressable>
        </View>

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
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có danh mục</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 12
  },
  formTitle: { color: "#0f172a", fontWeight: "700", fontSize: 16, marginBottom: 10 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10
  },
  typeButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center"
  },
  typeButtonActiveExpense: {
    borderColor: "#ef4444",
    backgroundColor: "#fee2e2"
  },
  typeButtonActiveIncome: {
    borderColor: "#16a34a",
    backgroundColor: "#dcfce7"
  },
  typeText: { color: "#334155", fontWeight: "600" },
  typeTextActive: { fontWeight: "700", color: "#0f172a" },
  saveButton: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  listContent: { gap: 10, paddingBottom: 24 },
  item: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  itemName: { color: "#0f172a", fontWeight: "700" },
  itemType: { color: "#64748b", fontWeight: "600", textTransform: "uppercase", fontSize: 12 },
  emptyText: { textAlign: "center", color: "#64748b", marginTop: 20 }
});
