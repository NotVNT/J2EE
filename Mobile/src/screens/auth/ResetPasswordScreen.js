import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../constants/api";
import { getApiErrorMessage } from "../../utils/format";
import { COLORS } from "../../constants/colors";
import {
  validatePasswordRequirements,
  isPasswordValid,
} from "../../utils/authPassword";
import PasswordInput from "../../components/auth/PasswordInput";
import PasswordRequirement from "../../components/auth/PasswordRequirement";
import { scale, clampScale } from "../../utils/layoutScale";

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const email = route.params?.email || "";
  const otp = route.params?.otp || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const req = useMemo(() => validatePasswordRequirements(password), [password]);
  const canProceed = isPasswordValid(req);

  const onReset = async () => {
    if (!canProceed) return;

    setLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, { email, otp, newPassword: password });
      Alert.alert(
        t("auth.common.success"),
        t("auth.resetPassword.successMessage"),
        [{ text: t("auth.common.login"), onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      const message = getApiErrorMessage(error, t("auth.resetPassword.failedMessage"));
      Alert.alert(t("auth.common.error"), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.bgGlowTop} />
        <View style={styles.bgGlowBottom} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t("auth.resetPassword.title")}</Text>
          <Text style={styles.subtitle}>{t("auth.resetPassword.subtitle")}</Text>

          <PasswordInput
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            focused={passwordFocused}
            placeholder={t("auth.resetPassword.placeholder")}
          />

          <Pressable
            style={[styles.resetButton, (!canProceed || loading) && styles.resetButtonDisabled]}
            onPress={onReset}
            disabled={!canProceed || loading}
          >
            <Text style={styles.resetButtonText}>
              {loading ? t("auth.resetPassword.loading") : t("auth.resetPassword.submit")}
            </Text>
          </Pressable>

          <PasswordRequirement req={req} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG,
  },
  bgGlowTop: {
    position: "absolute",
    top: -120,
    left: -100,
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: COLORS.PRIMARY_GLOW,
  },
  bgGlowBottom: {
    position: "absolute",
    right: -140,
    bottom: -120,
    width: scale(320),
    height: scale(320),
    borderRadius: scale(160),
    backgroundColor: COLORS.PRIMARY_GLOW,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: scale(28),
    paddingBottom: scale(20),
  },
  title: {
    fontSize: clampScale(26, 22, 30),
    fontWeight: "800",
    color: COLORS.DARK_TEXT,
    marginBottom: scale(8),
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.DARK_TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: scale(28),
  },
  resetButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: scale(12),
    height: scale(50),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(6),
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    color: COLORS.WHITE || "#FFFFFF",
    fontSize: clampScale(16, 14, 18),
    fontWeight: "800",
  },
});
