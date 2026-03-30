import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { SUCCESS_ALERT_MESSAGES, SUCCESS_ALERT_TITLE } from "../constants/alertMessages";
import { getApiErrorMessage, todayIso } from "../utils/format";
import { PickDateField } from "../utils/pickDate";

export default function AddExpenseScreen() {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [categoryId, setCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await http.get(API_ENDPOINTS.CATEGORY_BY_TYPE("expense"));
        const data = Array.isArray(response.data) ? response.data : [];
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(String(data[0].id));
        }
      } catch (error) {
        Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được danh mục"));
      }
    };

    fetchCategories();
  }, []);

  const onSave = async () => {
    const normalizedName = name.trim();
    const numericAmount = Number(amount);

    if (!normalizedName) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên khoản chi.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("Sai số tiền", "Vui lòng nhập số tiền hợp lệ > 0.");
      return;
    }

    if (!categoryId) {
      Alert.alert("Thiếu danh mục", "Vui lòng chọn danh mục.");
      return;
    }

    setSubmitting(true);
    try {
      await http.post(API_ENDPOINTS.ADD_EXPENSE, {
        name: normalizedName,
        amount: numericAmount,
        categoryId: Number(categoryId),
        date,
        icon: "💸"
      });

      Alert.alert(SUCCESS_ALERT_TITLE, SUCCESS_ALERT_MESSAGES.create.expense, [
        {
          text: "OK",
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      Alert.alert("Lưu thất bại", getApiErrorMessage(error, "Không thể tạo khoản chi"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Tên khoản chi</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ví dụ: Mua đồ ăn" />

      <Text style={styles.label}>Số tiền</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Ví dụ: 120000"
      />

      <PickDateField label="Ngày" value={date} onChange={setDate} />

      <Text style={styles.label}>Danh mục</Text>
      <View style={styles.categoryContainer}>
        {categories.map((category) => {
          const active = String(category.id) === String(categoryId);
          return (
            <Pressable
              key={String(category.id)}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
              onPress={() => setCategoryId(String(category.id))}
            >
              <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={[styles.saveButton, submitting && styles.saveButtonDisabled]} onPress={onSave} disabled={submitting}>
        <Text style={styles.saveButtonText}>{submitting ? "Đang lưu..." : "Lưu chi tiêu"}</Text>
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
    padding: 16
  },
  label: {
    color: "#334155",
    marginBottom: 6,
    fontWeight: "600"
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16
  },
  categoryChip: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
    alignItems: "center"
  },
  categoryChipActive: {
    borderColor: "#0f766e",
    backgroundColor: "#ccfbf1"
  },
  categoryText: {
    color: "#334155",
    textAlign: "center"
  },
  categoryTextActive: {
    color: "#115e59",
    fontWeight: "700"
  },
  saveButton: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center"
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700"
  }
});
