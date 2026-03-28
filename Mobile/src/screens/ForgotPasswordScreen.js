import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { getApiErrorMessage } from "../utils/format";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    if (!email.trim()) {
      Alert.alert("Thiếu email", "Vui lòng nhập email của bạn.");
      return;
    }

    setLoading(true);
    try {
      const response = await http.post(API_ENDPOINTS.FORGOT_PASSWORD, { email: email.trim() });
      Alert.alert("Thành công", response?.data?.message || "Đã gửi email đặt lại mật khẩu.", [
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
      ]);
    } catch (error) {
      Alert.alert("Thất bại", getApiErrorMessage(error, "Không thể gửi yêu cầu."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập email để nhận liên kết đặt lại mật khẩu.</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor="#94a3b8"
      />

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSend} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Đang gửi..." : "Gửi yêu cầu"}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Quay lại đăng nhập</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    justifyContent: "center"
  },
  title: { fontSize: 28, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  subtitle: { color: "#475569", marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: "#0f172a"
  },
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center"
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "700" },
  link: { textAlign: "center", marginTop: 12, color: "#0f766e", fontWeight: "600" }
});
