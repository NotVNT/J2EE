import React, { useContext, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { API_ENDPOINTS, BASE_URL } from "../constants/api";
import http from "../services/http";
import { getApiErrorMessage } from "../utils/format";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendReady, setBackendReady] = useState(null);

  const sanitizeAuthMessage = (message) => {
    if (!message) return "Vui lòng kiểm tra lại tài khoản.";
    return /otp|xac\s*thuc|xác\s*thực|kich\s*hoat|kích\s*hoạt|activate|verification|email/i.test(message)
      ? "Vui lòng kiểm tra lại tài khoản."
      : message;
  };

  useEffect(() => {
    let active = true;

    const checkBackend = async () => {
      try {
        await http.get(API_ENDPOINTS.HEALTH);
        if (active) {
          setBackendReady(true);
        }
      } catch {
        if (active) {
          setBackendReady(false);
        }
      }
    };

    checkBackend();

    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: normalizedEmail, password });
    } catch (error) {
      const message = getApiErrorMessage(error, "Vui lòng kiểm tra lại tài khoản.");
      Alert.alert("Đăng nhập thất bại", sanitizeAuthMessage(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MoneyManager</Text>
      <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
      <Text style={[styles.backendStatus, backendReady === false && styles.backendStatusError]}>
        {backendReady === null
          ? "Đang kiểm tra kết nối backend..."
          : backendReady
            ? "Backend đã sẵn sàng"
            : "Không kết nối được backend"}
      </Text>
      <Text style={styles.baseUrlText}>API: {BASE_URL}</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        secureTextEntry
        placeholder="Mật khẩu"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Text>
      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.actionText}>Tạo tài khoản</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.actionText}>Quên mật khẩu</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "#f8fafc"
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8
  },
  subtitle: {
    color: "#334155",
    marginBottom: 10
  },
  backendStatus: {
    color: "#0f766e",
    marginBottom: 4,
    fontSize: 12
  },
  backendStatusError: {
    color: "#dc2626"
  },
  baseUrlText: {
    color: "#64748b",
    marginBottom: 14,
    fontSize: 11
  },
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
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700"
  },
  actionsRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  actionText: {
    color: "#0f766e",
    fontWeight: "600"
  }
});
