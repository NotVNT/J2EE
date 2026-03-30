import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AuthContext } from "../components/AuthContext";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { SUCCESS_ALERT_MESSAGES, SUCCESS_ALERT_TITLE } from "../constants/alertMessages";
import { tokenStorage } from "../storage/tokenStorage";
import { getApiErrorMessage } from "../utils/format";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export default function EditProfileScreen() {
  const { user, refreshUser } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
  }, [user]);

  const onSave = useCallback(async () => {
    if (!fullName.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ và tên.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Email không hợp lệ", "Vui lòng nhập email hợp lệ.");
      return;
    }

    if (showPasswordFields) {
      if (!currentPassword.trim()) {
        Alert.alert("Thiếu thông tin", "Vui lòng nhập mật khẩu hiện tại.");
        return;
      }
      if (!newPassword.trim() || newPassword.trim().length < 6) {
        Alert.alert("Mật khẩu mới chưa hợp lệ", "Mật khẩu mới phải có ít nhất 6 ký tự.");
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert("Xác nhận mật khẩu", "Mật khẩu xác nhận chưa khớp.");
        return;
      }
    }

    setSaving(true);
    try {
      const response = await http.put(API_ENDPOINTS.UPDATE_PROFILE, {
        fullName: fullName.trim(),
        email: email.trim(),
        currentPassword: showPasswordFields ? currentPassword.trim() : "",
        newPassword: showPasswordFields ? newPassword.trim() : ""
      });

      const nextToken = response?.data?.token;
      if (nextToken) {
        await tokenStorage.setToken(nextToken);
      }

      await refreshUser();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordFields(false);
      Alert.alert(SUCCESS_ALERT_TITLE, SUCCESS_ALERT_MESSAGES.update.profile);
    } catch (error) {
      Alert.alert("Cập nhật thất bại", getApiErrorMessage(error, "Không thể cập nhật hồ sơ."));
    } finally {
      setSaving(false);
    }
  }, [confirmPassword, currentPassword, email, fullName, newPassword, refreshUser, showPasswordFields]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        <Text style={styles.subtitle}>Cập nhật thông tin cá nhân và mật khẩu theo nhu cầu của bạn.</Text>

        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nguyễn Văn A"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="tenban@example.com"
        />

        {showPasswordFields ? (
          <>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Nhập mật khẩu hiện tại"
            />

            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Ít nhất 6 ký tự"
            />

            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Nhập lại mật khẩu mới"
            />
          </>
        ) : (
          <Pressable style={styles.secondaryButton} onPress={() => setShowPasswordFields(true)}>
            <Text style={styles.secondaryButtonText}>Đổi mật khẩu</Text>
          </Pressable>
        )}

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={onSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14
  },
  title: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 20,
    marginBottom: 4
  },
  subtitle: {
    color: "#64748b",
    marginBottom: 14
  },
  label: {
    color: "#334155",
    marginBottom: 6,
    fontWeight: "600"
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    paddingVertical: 11,
    marginBottom: 12
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "700"
  },
  saveButton: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700"
  }
});
