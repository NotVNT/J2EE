import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { getApiErrorMessage } from "../utils/format";

export default function SignupScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sanitizeAuthMessage = (message) => {
    if (!message) return "Không thể tạo tài khoản.";
    return /otp|xac\s*thuc|xác\s*thực|kich\s*hoat|kích\s*hoạt|activate|verification|email/i.test(message)
      ? "Không thể tạo tài khoản. Vui lòng thử lại sau."
      : message;
  };

  const onSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      await http.post(API_ENDPOINTS.REGISTER, {
        fullName: fullName.trim(),
        email: email.trim(),
        password
      });

      Alert.alert("Đăng ký thành công", "Bạn có thể đăng nhập ngay.", [
        {
          text: "Đăng nhập",
          onPress: () => navigation.navigate("Login")
        }
      ]);
    } catch (error) {
      const message = getApiErrorMessage(error, "Không thể tạo tài khoản.");
      Alert.alert("Đăng ký thất bại", sanitizeAuthMessage(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tạo tài khoản</Text>

      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Họ và tên"
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Mật khẩu"
        placeholderTextColor="#94a3b8"
      />

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Đang xử lý..." : "Đăng ký"}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}> 
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 10, justifyContent: "center", flexGrow: 1 },
  title: { fontSize: 28, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0f172a"
  },
  button: {
    marginTop: 8,
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center"
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "700" },
  link: { textAlign: "center", color: "#0f766e", marginTop: 8, fontWeight: "600" }
});
