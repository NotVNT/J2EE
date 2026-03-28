import React, { useCallback, useContext, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { getApiErrorMessage } from "../utils/format";

export default function ProfileScreen() {
  const { user, refreshUser, signOut } = useContext(AuthContext);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const syncLocalForm = useCallback((profile) => {
    setFullName(profile?.fullName || "");
    setEmail(profile?.email || "");
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const profile = await refreshUser();
      syncLocalForm(profile || user);
    } catch (error) {
      Alert.alert("Lỗi", getApiErrorMessage(error, "Không tải được thông tin hồ sơ"));
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser, syncLocalForm, user]);

  useFocusEffect(
    useCallback(() => {
      syncLocalForm(user);
    }, [syncLocalForm, user])
  );

  const onSave = async () => {
    setSaving(true);
    try {
      await http.put(API_ENDPOINTS.UPDATE_PROFILE, {
        fullName: fullName.trim(),
        email: email.trim(),
        currentPassword: currentPassword.trim() || undefined,
        newPassword: newPassword.trim() || undefined
      });

      setCurrentPassword("");
      setNewPassword("");
      await refreshUser();
      Alert.alert("Thành công", "Đã cập nhật hồ sơ.");
    } catch (error) {
      Alert.alert("Cập nhật thất bại", getApiErrorMessage(error, "Không thể cập nhật hồ sơ."));
    } finally {
      setSaving(false);
    }
  };

  const onToggleAutoRenew = async (nextValue) => {
    try {
      await http.put(API_ENDPOINTS.UPDATE_AUTO_RENEW, { autoRenew: nextValue });
      await refreshUser();
    } catch (error) {
      Alert.alert("Không thể cập nhật", getApiErrorMessage(error, "Không đổi được trạng thái auto-renew."));
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Hồ sơ cá nhân</Text>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Họ và tên" />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mật khẩu hiện tại (nếu muốn đổi)</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Mật khẩu hiện tại"
        />

        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Mật khẩu mới"
        />

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={onSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Gói dịch vụ</Text>
        <Text style={styles.infoText}>Plan: {user?.subscriptionPlan || "FREE"}</Text>
        <Text style={styles.infoText}>Status: {user?.subscriptionStatus || "NONE"}</Text>
        <Text style={styles.infoText}>Hết hạn: {user?.subscriptionExpiresAt || "-"}</Text>

        <View style={styles.autoRenewRow}>
          <Text style={styles.infoText}>Tự động gia hạn</Text>
          <Pressable
            style={[styles.switch, user?.autoRenew && styles.switchOn]}
            onPress={() => onToggleAutoRenew(!Boolean(user?.autoRenew))}
          >
            <Text style={styles.switchText}>{user?.autoRenew ? "ON" : "OFF"}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12
  },
  title: { color: "#0f172a", fontWeight: "700", fontSize: 18, marginBottom: 8 },
  sectionTitle: { color: "#0f172a", fontWeight: "700", fontSize: 16, marginBottom: 6 },
  label: { color: "#334155", marginBottom: 5, fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10
  },
  saveButton: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center"
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  infoText: { color: "#475569", marginBottom: 4 },
  autoRenewRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  switch: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7
  },
  switchOn: {
    backgroundColor: "#99f6e4"
  },
  switchText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 12
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13
  },
  logoutText: { color: "#fff", fontWeight: "700" }
});
