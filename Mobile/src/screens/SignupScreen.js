import React, { useContext, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/AuthContext";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { getApiErrorMessage } from "../utils/format";
import devbotLogo from "../assets/devbot.png";

export default function SignupScreen() {
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ và tên.");
      return;
    }

    if (!normalizedEmail) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập email.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mật khẩu.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Mật khẩu yếu", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Xác nhận mật khẩu", "Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await http.post(API_ENDPOINTS.REGISTER, {
        fullName: normalizedName,
        email: normalizedEmail,
        password
      });

      Alert.alert(
        "Đăng ký thành công",
        "Vui lòng kiểm tra email để kích hoạt tài khoản.",
        [{ text: "Đăng nhập", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      const message = getApiErrorMessage(error, "Không thể đăng ký. Vui lòng thử lại.");
      Alert.alert("Đăng ký thất bại", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <Image source={devbotLogo} style={styles.brandLogo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Đăng ký để bắt đầu quản lý tài chính.</Text>

        <View style={styles.formCard}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Họ và tên"
              placeholderTextColor="#7f9085"
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email"
              placeholderTextColor="#7f9085"
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Mật khẩu"
              placeholderTextColor="#7f9085"
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#7f9085"
            />
          </View>

          <Pressable
            style={[styles.actionButton, loading && styles.actionButtonDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>{loading ? "Đang xử lý..." : "Đăng ký"}</Text>
          </Pressable>

          <Pressable style={styles.backButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.backButtonText}>Đã có tài khoản? Đăng nhập</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#05070b"
  },
  bgGlowTop: {
    position: "absolute",
    top: -120,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(58, 255, 98, 0.24)"
  },
  bgGlowBottom: {
    position: "absolute",
    right: -140,
    bottom: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(58, 255, 98, 0.18)"
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  brandRow: {
    alignItems: "center",
    marginBottom: 16
  },
  brandLogo: {
    width: 160,
    height: 50
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f2f8f3",
    textAlign: "center",
    marginBottom: 6
  },
  subtitle: {
    fontSize: 14,
    color: "#9bb0a1",
    textAlign: "center",
    marginBottom: 24
  },
  formCard: {
    backgroundColor: "#0a120e",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f3529",
    padding: 18,
    gap: 12
  },
  inputWrap: {
    backgroundColor: "#111f17",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#203a2b",
    paddingHorizontal: 14,
    height: 48,
    justifyContent: "center"
  },
  input: {
    color: "#e8f6ea",
    fontSize: 15
  },
  actionButton: {
    backgroundColor: "#22c55e",
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4
  },
  actionButtonDisabled: {
    opacity: 0.6
  },
  actionButtonText: {
    color: "#05250f",
    fontSize: 16,
    fontWeight: "700"
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 8
  },
  backButtonText: {
    color: "#6fcf97",
    fontSize: 13,
    fontWeight: "600"
  }
});