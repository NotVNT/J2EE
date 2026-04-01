import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/AuthContext";
import DevbotLoader from "../components/DevbotLoader";
import { getApiErrorMessage } from "../utils/format";
import { tokenStorage } from "../storage/tokenStorage";
import devbotLogo from "../assets/devbot.png";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRememberPreference = async () => {
      try {
        const remember = await tokenStorage.getRememberPreference();
        if (active) {
          setRememberMe(remember);
        }
      } catch {
        if (active) {
          setRememberMe(false);
        }
      }
    };

    loadRememberPreference();

    return () => {
      active = false;
    };
  }, []);

  const onToggleRemember = async (value) => {
    setRememberMe(value);
    try {
      await tokenStorage.setRememberPreference(value);
    } catch {
      // Ignore preference write errors and continue login flow.
    }
  };

  const onSubmit = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: normalizedEmail, password, rememberMe });
    } catch (error) {
      const isTimeout = error?.code === "ECONNABORTED";
      const isNetworkError = !error?.response && /network|timeout|socket|failed/i.test(String(error?.message || ""));
      const statusCode = error?.response?.status;
      const isServiceUnavailable = [502, 503, 504].includes(statusCode);

      console.tron?.error?.("[Login] API error", {
        code: error?.code,
        statusCode,
        message: error?.message,
        responseMessage: error?.response?.data?.message
      });

      if (isTimeout || isNetworkError || isServiceUnavailable) {
        Alert.alert(
          "Không kết nối được với máy chủ",
          "Hệ thống đang gặp sự cố kết nối. Vui lòng kiểm tra kết nối mạng của bạn hoặc thử lại sau ít phút."
        );
      } else {
        const message = getApiErrorMessage(error, "Không thể đăng nhập. Vui lòng kiểm tra lại tài khoản.");
        Alert.alert("Đăng nhập thất bại", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSocialPress = (provider) => {
    Alert.alert("Sắp có", `Đăng nhập bằng ${provider} chưa được kết nối.`);
  };

  return (
    <View style={styles.screen}>
      {loading ? <DevbotLoader text="Devbot đang xác thực" overlay /> : null}

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

        <Text style={styles.title}>Đăng nhập tài khoản</Text>
        <Text style={styles.subtitle}>Chào mừng bạn quay lại. Hãy chọn cách đăng nhập.</Text>

        <View style={styles.formCard}>
          <View style={styles.inputWrap}>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Nhập email"
              placeholderTextColor="#7f9085"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              secureTextEntry
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#7f9085"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.rowBetween}>
            <View style={styles.rememberRow}>
              <Switch
                value={rememberMe}
                onValueChange={onToggleRemember}
                thumbColor={rememberMe ? "#3aec43" : "#9ca3af"}
                trackColor={{ false: "#374151", true: "#14532d" }}
                style={styles.switch}
              />
              <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </Pressable>
          </View>

          <Pressable style={[styles.loginButton, loading && styles.loginButtonDisabled]} onPress={onSubmit} disabled={loading}>
            <Text style={styles.loginButtonText}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialBtn} onPress={() => onSocialPress("Google")}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialLabel}>Google</Text>
            </Pressable>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Chưa có tài khoản? </Text>
            <Pressable onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupLink}>Đăng ký</Text>
            </Pressable>
          </View>
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
  rowBetween: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]
  },
  rememberText: {
    color: "#9da8a1",
    fontSize: 12,
    marginLeft: 2
  },
  forgotText: {
    color: "#47ec55",
    fontSize: 12,
    fontWeight: "600"
  },
  loginButton: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: "#39dc3d",
    paddingVertical: 12,
    alignItems: "center"
  },
  loginButtonDisabled: {
    opacity: 0.7
  },
  loginButtonText: {
    color: "#082209",
    fontSize: 15,
    fontWeight: "800"
  },
  dividerRow: {
    marginTop: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1d2620"
  },
  dividerText: {
    color: "#7f8c84",
    fontSize: 12
  },
  socialRow: {
    flexDirection: "row",
    gap: 10
  },
  socialBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f2b23",
    backgroundColor: "#0e1612",
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  socialIcon: {
    color: "#f3f6f4",
    fontSize: 16,
    fontWeight: "700"
  },
  socialLabel: {
    color: "#dde5df",
    fontWeight: "600",
    fontSize: 13
  },
  signupRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  signupText: {
    color: "#95a29b",
    fontSize: 12
  },
  signupLink: {
    color: "#39dc3d",
    fontSize: 12,
    fontWeight: "700"
  }
});
