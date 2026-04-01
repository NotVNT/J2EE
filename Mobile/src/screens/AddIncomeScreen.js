import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { SUCCESS_ALERT_MESSAGES, SUCCESS_ALERT_TITLE } from "../constants/alertMessages";
import { formatCurrencyInput, getApiErrorMessage, parseCurrencyInput, todayIso } from "../utils/format";
import { PickDateField } from "../utils/pickDate";

export default function AddIncomeScreen() {
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
        const response = await http.get(API_ENDPOINTS.CATEGORY_BY_TYPE("income"));
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
    const numericAmount = parseCurrencyInput(amount);

    if (!normalizedName) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên khoản thu.");
      return;
    }

    if (!amount.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Số tiền.");
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
      await http.post(API_ENDPOINTS.ADD_INCOME, {
        name: normalizedName,
        amount: numericAmount,
        categoryId: Number(categoryId),
        date,
        icon: "💰"
      });

      Alert.alert(SUCCESS_ALERT_TITLE, SUCCESS_ALERT_MESSAGES.create.income, [
        {
          text: "OK",
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      Alert.alert("Lưu thất bại", getApiErrorMessage(error, "Không thể tạo khoản thu"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Tên khoản thu</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ví dụ: Lương tháng" />

      <Text style={styles.label}>Số tiền</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={(value) => setAmount(formatCurrencyInput(value))}
        keyboardType="numeric"
        placeholder="Ví dụ: 15.000.000"
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
        <Text style={styles.saveButtonText}>{submitting ? "Đang lưu..." : "Lưu thu nhập"}</Text>
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
    gap: 8,
    marginBottom: 16
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff"
  },
  categoryChipActive: {
    borderColor: "#15803d",
    backgroundColor: "#dcfce7"
  },
  categoryText: {
    color: "#334155"
  },
  categoryTextActive: {
    color: "#166534",
    fontWeight: "700"
  },
  saveButton: {
    backgroundColor: "#15803d",
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
