import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { getApiErrorMessage } from "../utils/format";
import devbotLogo from "../assets/devbot.png";

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

        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>Nhập email để nhận liên kết đặt lại mật khẩu.</Text>

        <View style={styles.formCard}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Nhập email"
              placeholderTextColor="#7f9085"
            />
          </View>

          <Pressable style={[styles.actionButton, loading && styles.actionButtonDisabled]} onPress={onSend} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? "Đang gửi..." : "Gửi yêu cầu"}</Text>
          </Pressable>

          <Pressable style={styles.backButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
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
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 30
  },
  brandRow: {
    alignSelf: "center",
    marginBottom: 20
  },
  brandLogo: {
    width: 220,
    height: 72
  },
  title: {
    color: "#f3faf4",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center"
  },
  subtitle: {
    marginTop: 8,
    color: "#9ca9a1",
    fontSize: 13,
    textAlign: "center"
  },
  formCard: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 220, 61, 0.2)",
    backgroundColor: "rgba(7, 12, 10, 0.84)",
    padding: 14
  },
  inputWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2b23",
    backgroundColor: "#0d1512",
    marginBottom: 10
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: "#f0f5f2"
  },
  actionButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: "#39dc3d",
    paddingVertical: 12,
    alignItems: "center"
  },
  actionButtonDisabled: {
    opacity: 0.7
  },
  actionButtonText: {
    color: "#082209",
    fontSize: 15,
    fontWeight: "800"
  },
  backButton: {
    marginTop: 12,
    alignItems: "center"
  },
  backButtonText: {
    color: "#39dc3d",
    fontSize: 12,
    fontWeight: "700"
  }
});
