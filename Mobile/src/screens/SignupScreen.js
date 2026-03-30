import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import http from "../services/http";
import { API_ENDPOINTS } from "../constants/api";
import { getApiErrorMessage } from "../utils/format";
import uploadProfileImage from "../utils/uploadProfileImage";
import devbotLogo from "../assets/devbot.png";

export default function SignupScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const sanitizeAuthMessage = (message) => {
    if (!message) return "Không thể tạo tài khoản.";
    return /otp|verify|verification|activate|email/i.test(message)
      ? "Không thể tạo tài khoản. Vui lòng thử lại sau."
      : message;
  };

  const onPickProfileImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Thiếu quyền truy cập", "Vui lòng cho phép ứng dụng truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });

    if (!result.canceled && result.assets?.length) {
      setProfilePhoto(result.assets[0]);
    }
  }, []);

  const onSignup = async () => {
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ và tên.");
      return;
    }

    if (!normalizedEmail || !password.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      let profileImageUrl = "";
      if (profilePhoto?.uri) {
        profileImageUrl = await uploadProfileImage(profilePhoto);
      }

      await http.post(API_ENDPOINTS.REGISTER, {
        fullName: normalizedName,
        email: normalizedEmail,
        password,
        ...(profileImageUrl ? { profileImageUrl } : {})
      });

      Alert.alert("Tạo tài khoản thành công", "Tài khoản đã sẵn sàng. Bạn có thể đăng nhập ngay.", [
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
        <Text style={styles.subtitle}>Bắt đầu quản lý tài chính thông minh hơn với botdev.</Text>

        <View style={styles.formCard}>
          <Pressable style={styles.avatarPlaceholder} onPress={onPickProfileImage}>
            {profilePhoto?.uri ? (
              <Image source={{ uri: profilePhoto.uri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>+</Text>
            )}
          </Pressable>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
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
              placeholder="Nhập email"
              placeholderTextColor="#7f9085"
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#7f9085"
            />
          </View>

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSignup} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Đang tạo tài khoản..." : "Đăng ký"}</Text>
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
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
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "#285b2f",
    backgroundColor: "#0f1d15",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
    overflow: "hidden"
  },
  avatarImage: {
    width: "100%",
    height: "100%"
  },
  avatarText: {
    color: "#58f05d",
    fontSize: 34,
    lineHeight: 36
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
  button: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: "#39dc3d",
    paddingVertical: 12,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: "#082209",
    fontSize: 15,
    fontWeight: "800"
  },
  loginRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  loginText: {
    color: "#95a29b",
    fontSize: 12
  },
  loginLink: {
    color: "#39dc3d",
    fontSize: 12,
    fontWeight: "700"
  }
});
