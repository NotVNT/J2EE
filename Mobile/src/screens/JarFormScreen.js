import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { COLORS } from "../constants/colors";
import { getApiErrorMessage } from "../utils/format";

const JAR_COLORS = [
  { value: "#8B5CF6", label: "Tím" },
  { value: "#10B981", label: "Xanh lá" },
  { value: "#F59E0B", label: "Vàng" },
  { value: "#EF4444", label: "Đỏ" },
  { value: "#3B82F6", label: "Xanh dương" },
  { value: "#EC4899", label: "Hồng" },
  { value: "#F97316", label: "Cam" },
  { value: "#06B6D4", label: "Xanh ngọc" },
  { value: "#6366F1", label: "Chàm" },
  { value: "#84CC16", label: "Xanh chuối" },
];

export default function JarFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const isEditing = route.params?.isEditing ?? false;
  const initialData = route.params?.initialData ?? null;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🏺");
  const [color, setColor] = useState("#8B5CF6");
  const [targetPercentage, setTargetPercentage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && initialData) {
      setName(initialData.name || "");
      setIcon(initialData.icon || "🏺");
      setColor(initialData.color || "#8B5CF6");
      setTargetPercentage(initialData.targetPercentage?.toString() || "");
    }
  }, [isEditing, initialData]);

  const onSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên hũ.");
      return;
    }

    const pct = trimmedName === "Ví tổng" ? 0 : parseFloat(targetPercentage);
    if (trimmedName !== "Ví tổng" && (isNaN(pct) || pct < 0 || pct > 100)) {
      Alert.alert("Tỉ lệ không hợp lệ", "Tỉ lệ phân bổ phải nằm trong khoảng từ 0% đến 100%.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        icon: icon.trim(),
        color,
        targetPercentage: pct,
      };

      if (isEditing && initialData?.id) {
        await http.put(API_ENDPOINTS.UPDATE_JAR(initialData.id), payload);
        Alert.alert("Thành công", "Đã cập nhật hũ chi tiêu.");
      } else {
        await http.post(API_ENDPOINTS.ADD_JAR, payload);
        Alert.alert("Thành công", "Đã tạo hũ chi tiêu mới thành công.");
      }

      navigation.goBack();
    } catch (err) {
      console.error("Lỗi lưu hũ:", err);
      Alert.alert("Lỗi", getApiErrorMessage(err, "Không thể lưu thông tin hũ."));
    } finally {
      setSubmitting(false);
    }
  };

  const isParentWallet = name === "Ví tổng";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Tên hũ chi tiêu</Text>
      <TextInput
        style={[styles.input, isParentWallet && styles.disabledInput]}
        value={name}
        onChangeText={setName}
        placeholder="Ví dụ: Ăn uống, Giải trí, Mua sắm"
        placeholderTextColor={COLORS.TEXT_MUTED}
        editable={!isParentWallet}
      />

      <Text style={styles.label}>Biểu tượng (Emoji)</Text>
      <TextInput
        style={styles.input}
        value={icon}
        onChangeText={setIcon}
        placeholder="Nhập 1 emoji đại diện, ví dụ: 🍔, 🛍️"
        placeholderTextColor={COLORS.TEXT_MUTED}
        maxLength={5}
      />

      <Text style={styles.label}>Tỷ lệ phân bổ (%)</Text>
      {isParentWallet ? (
        <View style={styles.parentWalletInfo}>
          <Text style={styles.parentWalletText}>
            Tỷ lệ của Ví tổng được **tự động tính** bằng phần trăm còn lại (100% - tổng các hũ khác).
          </Text>
        </View>
      ) : (
        <TextInput
          style={styles.input}
          value={targetPercentage}
          onChangeText={(val) => setTargetPercentage(val.replace(/[^0-9.]/g, ""))}
          placeholder="Ví dụ: 25"
          placeholderTextColor={COLORS.TEXT_MUTED}
          keyboardType="numeric"
        />
      )}

      {/* Premium Color Picker */}
      <Text style={styles.label}>Màu sắc đại diện</Text>
      <View style={styles.colorsGrid}>
        {JAR_COLORS.map((c) => {
          const isSelected = color === c.value;
          return (
            <Pressable
              key={c.value}
              onPress={() => setColor(c.value)}
              style={[
                styles.colorCircle,
                { backgroundColor: c.value },
                isSelected && styles.selectedColorCircle,
              ]}
              title={c.label}
            />
          );
        })}
      </View>

      <Pressable
        style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
        onPress={onSave}
        disabled={submitting}
      >
        <Text style={styles.saveButtonText}>
          {submitting ? "Đang lưu..." : isEditing ? "Cập nhật hũ" : "Tạo hũ chi tiêu"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  content: {
    padding: 16,
  },
  label: {
    color: COLORS.TEXT,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.TEXT,
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: COLORS.BG,
    color: COLORS.TEXT_MUTED,
  },
  parentWalletInfo: {
    backgroundColor: COLORS.INFO_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d0e3f5",
    padding: 12,
  },
  parentWalletText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  colorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginVertical: 12,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorCircle: {
    borderColor: COLORS.PRIMARY,
    transform: [{ scale: 1.1 }],
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 24,
    shadowColor: COLORS.PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontWeight: "800",
    fontSize: 15,
  },
});
